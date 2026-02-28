package com.mockbridge.auth_service.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

// this files read value from application.yml file and provide to JwtService
@ConfigurationProperties(prefix = "auth.jwt")
public class JwtProperties {

    private String issuer;
    private int accessTokenMinutes;
    private int refreshTokenDays;
    private String secret;

    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }

    public int getAccessTokenMinutes() {
        return accessTokenMinutes;
    }

    public void setAccessTokenMinutes(int accessTokenMinutes) {
        this.accessTokenMinutes = accessTokenMinutes;
    }

    public int getRefreshTokenDays() {
        return refreshTokenDays;
    }

    public void setRefreshTokenDays(int refreshTokenDays) {
        this.refreshTokenDays = refreshTokenDays;
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }
}