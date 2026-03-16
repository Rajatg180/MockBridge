package com.mockbridge.chat_service.security;

import java.util.UUID;

import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;

@Component
public class GatewayAuthResolver {

    public GatewayAuth resolve(HttpServletRequest request) {
        String userId = request.getHeader("X-User-Id");
        String email = request.getHeader("X-User-Email");
        String role = request.getHeader("X-User-Role");

        if (userId == null || role == null) {
            return null;
        }

        return new GatewayAuth(UUID.fromString(userId), email, role);
    }
}