package com.mockbridge.interview_service.security;

import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;

// component annotion is used to make this class a bean that can be injected into controllers or services where we need to resolve user info from the gateway headers
@Component
public class GatewayAuthResolver {

    // this is a simple resolver that extracts user info from headers set by the gateway after JWT validation
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