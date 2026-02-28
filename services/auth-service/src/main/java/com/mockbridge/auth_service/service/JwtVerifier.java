package com.mockbridge.auth_service.service;

import java.nio.charset.StandardCharsets;
import java.text.ParseException;

import org.springframework.stereotype.Service;

import com.mockbridge.auth_service.config.JwtProperties;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.SignedJWT;

/**
 * Verifies and parses JWT access tokens (HS256).
 *
 * - checks signature
 * - returns parsed SignedJWT if valid
 */
@Service
public class JwtVerifier {

    private final JwtProperties props;
    private final MACVerifier verifier;

    public JwtVerifier(JwtProperties props) {
        this.props = props;

        byte[] secretBytes = props.getSecret().getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            throw new IllegalStateException("auth.jwt.secret must be at least 32 bytes for HS256");
        }

        try {
            this.verifier = new MACVerifier(secretBytes);
        } catch (JOSEException e) {
            throw new IllegalStateException("Failed to initialize JWT verifier", e);
        }
    }

    public SignedJWT verifyAndParse(String token) {
        try {
            SignedJWT jwt = SignedJWT.parse(token);

            boolean signatureOk = jwt.verify(verifier);
            if (!signatureOk) {
                throw new IllegalArgumentException("Invalid JWT signature");
            }

            // Basic issuer check (good practice)
            String issuer = jwt.getJWTClaimsSet().getIssuer();
            if (issuer == null || !issuer.equals(props.getIssuer())) {
                throw new IllegalArgumentException("Invalid JWT issuer");
            }

            // Expiry check
            var exp = jwt.getJWTClaimsSet().getExpirationTime();
            if (exp == null || exp.getTime() < System.currentTimeMillis()) {
                throw new IllegalArgumentException("JWT expired");
            }

            return jwt;
        } catch (ParseException e) {
            throw new IllegalArgumentException("Malformed JWT", e);
        } catch (JOSEException e) {
            throw new IllegalArgumentException("JWT verification failed", e);
        }
    }
}