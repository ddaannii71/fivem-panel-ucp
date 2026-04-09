package com.fivem.panel.auth_service.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    // Generamos una clave secreta súper segura y aleatoria para firmar los tokens
    private static final String SECRET = "EstaEsUnaClaveSecretaMuyLargaParaFiveMPanelUCPDeDaniel2026!";
    private static final java.security.Key SECRET_KEY = io.jsonwebtoken.security.Keys.hmacShaKeyFor(SECRET.getBytes());
    // Tiempo de vida del token (1 día en milisegundos)
    private static final long EXPIRATION_TIME = 86400000;

    // Método que fabrica la "pulsera VIP"
    public String generateToken(String identifier, String role) {
        return Jwts.builder()
                .setSubject(identifier) // A quién le pertenece (license:admin123)
                .claim("role", role) // Qué permisos tiene (admin)
                .setIssuedAt(new Date()) // Fecha de creación
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) // Fecha de caducidad
                .signWith(SECRET_KEY) // Lo firmamos para que nadie lo pueda falsificar
                .compact(); // Lo convertimos en texto
    }
}