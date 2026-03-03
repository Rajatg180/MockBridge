package com.mockbridge.api_gateway.config;

import java.nio.charset.StandardCharsets;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mockbridge.api_gateway.exception.ApiErrorResponse;
import org.springframework.http.HttpStatus;
import reactor.core.publisher.Mono;

@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
public class SecurityConfig {

        @Value("${auth.jwt.secret}")
        private String jwtSecret;

        @Bean
        public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http,
                        ObjectMapper objectMapper) {

                return http
                                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                                .authorizeExchange(exchange -> exchange
                                                .pathMatchers("/auth/register").permitAll()
                                                .pathMatchers("/auth/login").permitAll()
                                                .pathMatchers("/auth/refresh").permitAll()
                                                .pathMatchers("/auth/logout").permitAll()
                                                .pathMatchers("/actuator/**").permitAll()
                                                .anyExchange().authenticated())
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint((exchange, ex1) -> {

                                                        var response = exchange.getResponse();
                                                        response.setStatusCode(HttpStatus.UNAUTHORIZED);
                                                        response.getHeaders().add("Content-Type", "application/json");

                                                        ApiErrorResponse error = new ApiErrorResponse(
                                                                        401,
                                                                        "Unauthorized",
                                                                        "Invalid or missing JWT",
                                                                        exchange.getRequest().getPath().value());

                                                        try {
                                                                byte[] bytes = objectMapper.writeValueAsBytes(error);
                                                                return response.writeWith(
                                                                                Mono.just(response.bufferFactory()
                                                                                                .wrap(bytes)));
                                                        } catch (Exception e) {
                                                                return Mono.error(e);
                                                        }
                                                })
                                                .accessDeniedHandler((exchange, ex2) -> {

                                                        var response = exchange.getResponse();
                                                        response.setStatusCode(HttpStatus.FORBIDDEN);
                                                        response.getHeaders().add("Content-Type", "application/json");

                                                        ApiErrorResponse error = new ApiErrorResponse(
                                                                        403,
                                                                        "Forbidden",
                                                                        "Access denied",
                                                                        exchange.getRequest().getPath().value());

                                                        try {
                                                                byte[] bytes = objectMapper.writeValueAsBytes(error);
                                                                return response.writeWith(
                                                                                Mono.just(response.bufferFactory()
                                                                                                .wrap(bytes)));
                                                        } catch (Exception e) {
                                                                return Mono.error(e);
                                                        }
                                                }))
                                .oauth2ResourceServer(oauth -> oauth
                                                .authenticationEntryPoint((exchange, ex) -> {

                                                        var response = exchange.getResponse();
                                                        response.setStatusCode(HttpStatus.UNAUTHORIZED);
                                                        response.getHeaders().add("Content-Type", "application/json");

                                                        ApiErrorResponse error = new ApiErrorResponse(
                                                                        401,
                                                                        "Unauthorized",
                                                                        ex.getMessage(),
                                                                        exchange.getRequest().getPath().value());

                                                        try {
                                                                byte[] bytes = new ObjectMapper()
                                                                                .writeValueAsBytes(error);
                                                                return response.writeWith(
                                                                                Mono.just(response.bufferFactory()
                                                                                                .wrap(bytes)));
                                                        } catch (Exception e) {
                                                                return Mono.error(e);
                                                        }
                                                })
                                                .jwt(jwt -> {
                                                }))
                                .build();
        }

        @Bean
        public ReactiveJwtDecoder reactiveJwtDecoder() {

                byte[] secretBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);

                SecretKeySpec secretKey = new SecretKeySpec(secretBytes, "HmacSHA256");

                return NimbusReactiveJwtDecoder
                                .withSecretKey(secretKey)
                                .build();
        }
}