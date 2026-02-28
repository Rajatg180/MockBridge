package com.mockbridge.auth_service.service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;
import org.springframework.stereotype.Service;
import com.mockbridge.auth_service.config.JwtProperties;
import com.mockbridge.auth_service.entity.Role;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.JWSObject;

@Service
public class JwtService {

    private final JwtProperties props;
    private final JWSSigner signer;

    public JwtService(JwtProperties props) {
        this.props = props;

        // convert secret to bytes 
        byte[] secretBytes = props.getSecret().getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            throw new IllegalStateException("auth.jwt.secret must be at least 32 bytes for HS256");
        }

        try {
            this.signer = new MACSigner(secretBytes);
        } catch (JOSEException e) {
            throw new IllegalStateException("Failed to initialize JWT signer", e);
        }
    }

    /**
     * Create access token with standard + custom claims.
     */
    public String generateAccessToken(UUID userId, String email, Role role) {
        Instant now = Instant.now();
        Instant exp = now.plus(props.getAccessTokenMinutes(), ChronoUnit.MINUTES);

        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer(props.getIssuer())
                .subject(userId.toString())    
                .claim("email", email)
                .claim("role", role.name())
                .issueTime(Date.from(now))
                .expirationTime(Date.from(exp))
                .build();

        JWSObject jws = new JWSObject(
                new JWSHeader(JWSAlgorithm.HS256),
                new com.nimbusds.jose.Payload(claims.toJSONObject())
        );

        try {
            jws.sign(signer);
        } catch (JOSEException e) {
            throw new IllegalStateException("Failed to sign JWT", e);
        }

        return jws.serialize();
    }
}