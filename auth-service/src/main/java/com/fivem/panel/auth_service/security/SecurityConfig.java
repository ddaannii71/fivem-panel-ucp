package com.fivem.panel.auth_service.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;

import java.io.IOException;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtUtil jwtUtil;

    // Inyectamos nuestra fábrica de tokens
    public SecurityConfig(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Desactivamos esto porque nuestra API usará Tokens JWT
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/login").permitAll() // 1. ADMINS: Vía libre para hacer el POST
                                                                    // tradicional
                        .anyRequest().authenticated() // Todo lo demás está protegido
                )
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(this::discordSuccessHandler) // 2. JUGADORES: ¿Qué hacemos cuando Discord los
                                                                     // aprueba?
                );

        return http.build();
    }

    // --- LA MAGIA HÍBRIDA ---
    private void discordSuccessHandler(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException {
        // 1. Obtenemos los datos que nos manda Discord
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String discordId = oauthUser.getAttribute("id"); // El ID numérico de Discord del jugador

        // 2. Aquí es donde le fabricamos LA MISMA pulsera VIP que al Admin, pero con
        // rol "user"
        // (Nota: En el futuro, aquí buscaremos en la BD de FiveM si su DiscordID está
        // vinculado a una cuenta)
        String token = jwtUtil.generateToken("discord:" + discordId, "user");

        // 3. Redirigimos al jugador a nuestra página web (Frontend) pasándole el Token
        // en la URL
        // Suponemos que nuestro Front estará en el puerto 3000 (React, Vue, etc.)
        response.sendRedirect("http://localhost:3000/login?token=" + token);
    }
}