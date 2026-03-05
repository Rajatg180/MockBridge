package com.mockbridge.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;

import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers;
import org.springframework.web.cors.reactive.CorsConfigurationSource;

import com.mockbridge.api_gateway.exception.SecurityErrorWriter;

@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
public class SecurityConfig {

    /**
     * PUBLIC CHAIN (NO JWT validation)
     * Matches:
     * - OPTIONS /** (preflight)
     * - /auth/** (register/login/refresh/logout)
     * - /actuator/**
     */
    // order annotations ensure that the most specific matchers are evaluated first, so OPTIONS and /auth/** are evaluated before the protected chain
    @Bean
    @Order(1)
    public SecurityWebFilterChain publicChain(ServerHttpSecurity http,
                                              CorsConfigurationSource corsSource) {

        return http
                .securityMatcher(ServerWebExchangeMatchers.pathMatchers(
                        HttpMethod.OPTIONS, "/**"
                ))
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(cors -> cors.configurationSource(corsSource))
                .authorizeExchange(ex -> ex.anyExchange().permitAll())
                .build();
    }

    /**
     * PUBLIC CHAIN for /auth/** and /actuator/**
     * Separated from OPTIONS matcher above because pathMatchers with OPTIONS only matches OPTIONS.
     */
    @Bean
    @Order(2)
    public SecurityWebFilterChain publicPathChain(ServerHttpSecurity http,
                                                  CorsConfigurationSource corsSource) {

        return http
                .securityMatcher(ServerWebExchangeMatchers.pathMatchers(
                        "/auth/**",
                        "/actuator/**"
                ))
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(cors -> cors.configurationSource(corsSource))
                .authorizeExchange(ex -> ex.anyExchange().permitAll())
                .build();
    }

    /**
     * PROTECTED CHAIN (JWT required)
     * Matches: everything else
     */
    @Bean
    @Order(3)
    public SecurityWebFilterChain protectedChain(ServerHttpSecurity http,
                                                 CorsConfigurationSource corsSource,
                                                 SecurityErrorWriter errorWriter) {

        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(cors -> cors.configurationSource(corsSource))

                .authorizeExchange(ex -> ex
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .anyExchange().authenticated()
                )

                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((exchange, e) ->
                                errorWriter.write(exchange, HttpStatus.UNAUTHORIZED, "Invalid or missing JWT"))
                        .accessDeniedHandler((exchange, e) ->
                                errorWriter.write(exchange, HttpStatus.FORBIDDEN, "Access denied"))
                )

                .oauth2ResourceServer(oauth -> oauth
                        .authenticationEntryPoint((exchange, e) ->
                                errorWriter.write(exchange, HttpStatus.UNAUTHORIZED, e.getMessage()))
                        .jwt(jwt -> {})
                )
                .build();
    }
}