// already our gateway is doing jwt validation , so we interview service and authroize by headers

package com.mockbridge.interview_service.security;

import java.util.UUID;

public class GatewayAuth {

    private final UUID userId;
    private final String email;
    private final String role;

    public GatewayAuth(UUID userId, String email, String role) {
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