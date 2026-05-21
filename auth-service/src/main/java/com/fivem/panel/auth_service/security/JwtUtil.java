package com.fivem.panel.auth_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

// Clase de utilidad para crear y validar tokens JWT
@Component
public class JwtUtil {

    // El token va a durar 24 horas (en milisegundos)
    private static final long EXPIRATION_TIME = 86400000;

    // La clave secreta para firmar los tokens
    private final Key signingKey;

    // Constructor: recoge la clave de application.properties
    public JwtUtil(@Value("${jwt.secret}") String secret) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes());
    }

    // Crea un token JWT con el subject (la licencia o discord:ID) y el rol
    public String generateToken(String subject, String role) {
        Date ahora = new Date();
        Date expira = new Date(System.currentTimeMillis() + EXPIRATION_TIME);

        return Jwts.builder()
                .setSubject(subject)
                .claim("role", role)
                .setIssuedAt(ahora)
                .setExpiration(expira)
                .signWith(signingKey)
                .compact();
    }

    // Comprueba si un token es valido (firma correcta y no caducado)
    public boolean validateToken(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (JwtException e) {
            return false;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    // Saca el subject del token (la licencia)
    public String extractSubject(String token) {
        return extractAllClaims(token).getSubject();
    }

    // Saca el rol del token
    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    // Metodo privado que parsea el token y devuelve todos los claims
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
