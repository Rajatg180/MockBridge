package com.mockbridge.auth_service.controller;

import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mockbridge.auth_service.security.AuthenticatedUser;

/**
 * Test endpoint to verify JWT validation works.
 */
@RestController
public class MeController {

    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {
        AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();

        return Map.of(
                "userId", user.getUserId().toString(),
                "email", user.getEmail(),
                "role", user.getRole()
        );
    }
}