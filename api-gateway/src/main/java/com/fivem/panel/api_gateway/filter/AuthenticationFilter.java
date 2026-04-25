package com.fivem.panel.api_gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.security.Key;
import java.util.List;

@Component
public class AuthenticationFilter implements GlobalFilter {

    // Rutas que no necesitan token
    private static final List<String> PUBLIC_PATHS = List.of(
            "/auth/"
    );

    // Rutas que además requieren rol admin o superadmin
    // El Gateway elimina el prefijo del servicio, así que comprobamos por el nombre del servicio en la URL original
    private static final List<String> ADMIN_SERVICES = List.of(
            "mgmt-service"
    );

    private final Key secretKey;

    public AuthenticationFilter(@Value("${jwt.secret}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        // 1. Rutas públicas: pasan sin token
        if (PUBLIC_PATHS.stream().anyMatch(path::contains)) {
            return chain.filter(exchange);
        }

        // 2. Extraer y validar el token
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return reject(exchange, HttpStatus.UNAUTHORIZED);
        }

        Claims claims;
        try {
            claims = Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(authHeader.substring(7))
                    .getBody();
        } catch (Exception e) {
            return reject(exchange, HttpStatus.UNAUTHORIZED);
        }

        // 3. RBAC: servicios de admin — comprobamos en la URL original del cliente
        //    que incluye el prefijo del servicio (ej: /mgmt-service/...)
        String rawPath = exchange.getRequest().getPath().value();
        if (ADMIN_SERVICES.stream().anyMatch(rawPath::contains)) {
            String role = claims.get("role", String.class);
            if (role == null || (!role.equalsIgnoreCase("admin") && !role.equalsIgnoreCase("superadmin"))) {
                return reject(exchange, HttpStatus.FORBIDDEN);
            }
        }

        // 4. Token válido (y rol suficiente si aplica): dejar pasar
        return chain.filter(exchange);
    }

    private Mono<Void> reject(ServerWebExchange exchange, HttpStatus status) {
        exchange.getResponse().setStatusCode(status);
        return exchange.getResponse().setComplete();
    }
}
