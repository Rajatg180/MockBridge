package com.mockbridge.auth_service.service;

import java.time.LocalDateTime;
import java.util.UUID;
import java.time.Instant;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.mockbridge.auth_service.exception.UnauthorizedException;
import com.mockbridge.auth_service.config.JwtProperties;
import com.mockbridge.auth_service.dto.AuthResponse;
import com.mockbridge.auth_service.dto.LoginRequest;
import com.mockbridge.auth_service.dto.RegisterRequest;
import com.mockbridge.auth_service.entity.RefreshToken;
import com.mockbridge.auth_service.entity.Role;
import com.mockbridge.auth_service.entity.User;
import com.mockbridge.auth_service.repository.RefreshTokenRepository;
import com.mockbridge.auth_service.repository.UserRepository;

/**
 * Business logic for authentication flow.
 *
 * - Register: create user + issue tokens
 * - Login: verify password + issue tokens
 *
 * Refresh token is stored in DB so it can be revoked later (logout).
 */
@Service
public class AuthService {

    private final UserRepository userRepo;
    private final RefreshTokenRepository refreshRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties props;

    public AuthService(
            UserRepository userRepo,
            RefreshTokenRepository refreshRepo,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            JwtProperties props) {
        this.userRepo = userRepo;
        this.refreshRepo = refreshRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.props = props;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.getEmail().trim().toLowerCase();

        if (userRepo.existsByEmail(email)) {
            // In production you'd return 409 Conflict with a proper error body.
            throw new IllegalArgumentException("Email already registered");
        }

        LocalDateTime now = LocalDateTime.now();

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setRole(Role.USER); // default role for new users
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        userRepo.save(user);

        // Issue access token (stateless)
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());

        // Issue refresh token (stateful)
        String refreshToken = UUID.randomUUID() + "-" + UUID.randomUUID(); // good enough for now (we'll harden later)

        RefreshToken rt = new RefreshToken();
        rt.setId(UUID.randomUUID());
        rt.setUser(user);
        rt.setToken(refreshToken);
        rt.setCreatedAt(now);
        rt.setRevoked(false);
        rt.setExpiresAt(now.plusDays(props.getRefreshTokenDays()));

        refreshRepo.save(rt);

        return new AuthResponse(accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        String email = req.getEmail().trim().toLowerCase();

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        // New access token each login
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());

        // You can either reuse existing refresh token or create a new one.
        // We'll create a new one and keep old ones (multi-device).
        LocalDateTime now = LocalDateTime.now();
        String refreshToken = UUID.randomUUID() + "-" + UUID.randomUUID();

        RefreshToken rt = new RefreshToken();
        rt.setId(UUID.randomUUID());
        rt.setUser(user);
        rt.setToken(refreshToken);
        rt.setCreatedAt(now);
        rt.setRevoked(false);
        rt.setExpiresAt(now.plusDays(props.getRefreshTokenDays()));

        refreshRepo.save(rt);

        return new AuthResponse(accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse refresh(String refreshTokenValue) {

        RefreshToken token = refreshRepo
                .findByToken(refreshTokenValue)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (token.isRevoked()) {
            throw new UnauthorizedException("Refresh token revoked");
        }

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Refresh token expired");
        }

        User user = token.getUser();

        String newAccessToken = jwtService.generateAccessToken(
                user.getId(),
                user.getEmail(),
                user.getRole());

        return new AuthResponse(newAccessToken, refreshTokenValue);
    }

    @Transactional
    public void logout(String refreshTokenValue) {

        RefreshToken token = refreshRepo
                .findByToken(refreshTokenValue)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (token.isRevoked()) {
            return;
        }

        token.setRevoked(true);
        refreshRepo.save(token);
    }
}