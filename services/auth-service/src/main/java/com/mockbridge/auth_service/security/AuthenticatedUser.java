package com.mockbridge.auth_service.security;

import java.util.UUID;

public class AuthenticatedUser {
    private final UUID userId;
    private final String email;
    private final String role;

    public AuthenticatedUser(UUID userId, String email, String role) {
        this.userId = userId;
        this.email = email;
        this.role = role;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}