package com.mockbridge.auth_service.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request body for refresh endpoint.
 */
public class RefreshRequest {

    @NotBlank
    private String refreshToken;

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}