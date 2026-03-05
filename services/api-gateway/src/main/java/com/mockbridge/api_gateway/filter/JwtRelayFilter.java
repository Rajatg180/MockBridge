package com.mockbridge.api_gateway.filter;

import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

// This filter extracts user info from JWT and adds it to downstream request headers
// first request goes 
@Component
public class JwtRelayFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange,
                            org.springframework.cloud.gateway.filter.GatewayFilterChain chain) {

        return ReactiveSecurityContextHolder.getContext()
                .flatMap(context -> {
                    var authentication = context.getAuthentication();

                    if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {

                        String userId = jwt.getSubject();
                        String email = jwt.getClaimAsString("email");
                        String role = jwt.getClaimAsString("role");

                        ServerWebExchange mutatedExchange = exchange.mutate()
                                .request(builder -> {
                                    if (userId != null) builder.header("X-User-Id", userId);
                                    if (email != null) builder.header("X-User-Email", email);
                                    if (role != null) builder.header("X-User-Role", role);
                                })
                                .build();

                        return chain.filter(mutatedExchange);
                    }

                    return chain.filter(exchange);
                })
                .switchIfEmpty(chain.filter(exchange));
    }

    @Override
    public int getOrder() {
        return -1;
    }
}