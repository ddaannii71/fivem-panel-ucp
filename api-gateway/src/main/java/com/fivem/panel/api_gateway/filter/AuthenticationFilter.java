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
import java.util.Arrays;
import java.util.List;

// Filtro global del API Gateway
// Cada peticion pasa por aqui antes de llegar a su microservicio
// Comprueba el JWT y el rol si hace falta
@Component
public class AuthenticationFilter implements GlobalFilter {

    // Rutas que pueden pasar sin token (login, OAuth, etc)
    private static final List<String> PUBLIC_PATHS = Arrays.asList(
            "/auth/",
            "/oauth2/",
            "/login/oauth2/"
    );

    // Servicios que solo pueden usar admins o superadmins
    private static final List<String> ADMIN_SERVICES = Arrays.asList(
            "mgmt-service"
    );

    // La clave secreta para validar los JWT (la misma que usa auth-service)
    private final Key secretKey;

    // Constructor que recoge la clave de application.properties
    public AuthenticationFilter(@Value("${jwt.secret}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
    }

    // Filtro principal que se ejecuta en cada peticion
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // Cojo la URL de la peticion
        String path = exchange.getRequest().getURI().getPath();

        // 1. Si es una ruta publica, la dejo pasar sin mirar nada
        for (String publica : PUBLIC_PATHS) {
            if (path.contains(publica)) {
                return chain.filter(exchange);
            }
        }

        // 2. Saco el header Authorization de la peticion
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        // Si no hay token o no empieza por "Bearer ", devuelvo 401
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return reject(exchange, HttpStatus.UNAUTHORIZED);
        }

        // 3. Intento parsear el token
        Claims claims;
        try {
            String token = authHeader.substring(7);
            claims = Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            // Si el token es invalido o ha caducado, 401
            return reject(exchange, HttpStatus.UNAUTHORIZED);
        }

        // 4. Compruebo si la ruta es de un servicio de admin
        String rawPath = exchange.getRequest().getPath().value();
        boolean esRutaAdmin = false;
        for (String servicio : ADMIN_SERVICES) {
            if (rawPath.contains(servicio)) {
                esRutaAdmin = true;
                break;
            }
        }

        // Si es ruta de admin, miro el rol del usuario
        if (esRutaAdmin) {
            String role = claims.get("role", String.class);
            boolean esAdmin = role != null
                    && (role.equalsIgnoreCase("admin") || role.equalsIgnoreCase("superadmin"));
            if (!esAdmin) {
                // No tiene permisos: 403
                return reject(exchange, HttpStatus.FORBIDDEN);
            }
        }

        // 5. Todo OK, dejo pasar la peticion
        return chain.filter(exchange);
    }

    // Metodo auxiliar que rechaza la peticion con un codigo HTTP
    private Mono<Void> reject(ServerWebExchange exchange, HttpStatus status) {
        exchange.getResponse().setStatusCode(status);
        return exchange.getResponse().setComplete();
    }
}
