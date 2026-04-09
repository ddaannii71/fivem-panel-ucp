package com.fivem.panel.api_gateway.filter;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.security.Key;

@Component
public class AuthenticationFilter implements GlobalFilter {

    // TIENE QUE SER EXACTAMENTE LA MISMA CLAVE QUE PUSIMOS EN EL AUTH-SERVICE
    private static final String SECRET = "EstaEsUnaClaveSecretaMuyLargaParaFiveMPanelUCPDeDaniel2026!";
    private static final Key SECRET_KEY = Keys.hmacShaKeyFor(SECRET.getBytes());

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        // 1. ZONA PÚBLICA: Dejamos pasar el Login tradicional y el de Discord sin pedir
        // Token
        if (path.contains("/auth/") || path.contains("/oauth2/") || path.contains("/login/oauth2/")) {
            return chain.filter(exchange);
        }

        // 2. ZONA PRIVADA: Comprobamos si nos han enseñado la "Pulsera VIP" (El header
        // Authorization)
        if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
            // Si no hay token, patada en la puerta (Error 401)
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        // 3. VALIDACIÓN: Comprobamos que el Token es real y no está caducado
        String token = authHeader.substring(7); // Le quitamos la palabra "Bearer "
        try {
            Jwts.parserBuilder().setSigningKey(SECRET_KEY).build().parseClaimsJws(token);
        } catch (Exception e) {
            // Si el token es falso o caducó, patada en la puerta (Error 401)
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        // 4. ÉXITO: El token es válido, le dejamos pasar al microservicio
        // correspondiente
        return chain.filter(exchange);
    }
}