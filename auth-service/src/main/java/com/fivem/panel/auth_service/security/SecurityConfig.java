package com.fivem.panel.auth_service.security;

import com.fivem.panel.auth_service.model.User;
import com.fivem.panel.auth_service.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.ResponseEntity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    private static final String FRONTEND_URL      = "http://localhost:3000";
    private static final String MGMT_DISCORD_URL  = "http://MGMT-SERVICE/players/discord/{discordId}";

    private final JwtUtil        jwtUtil;
    private final UserRepository userRepository;
    private final RestTemplate   restTemplate;

    public SecurityConfig(JwtUtil jwtUtil, UserRepository userRepository, RestTemplate restTemplate) {
        this.jwtUtil        = jwtUtil;
        this.userRepository = userRepository;
        this.restTemplate   = restTemplate;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/login").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(this::discordSuccessHandler)
                );

        return http.build();
    }

    @SuppressWarnings("unchecked")
    private void discordSuccessHandler(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String discordId = oauthUser.getAttribute("id");

        // 1. Preguntar al mgmt-service qué licencia tiene ese Discord ID en txAdmin
        String license;
        try {
            ResponseEntity<Map> mgmtResponse = restTemplate.getForEntity(
                    MGMT_DISCORD_URL, Map.class, discordId);

            Map<String, Object> body = mgmtResponse.getBody();
            if (body == null || !body.containsKey("license")) {
                log.warn("mgmt-service no devolvió licencia para discordId={}", discordId);
                response.sendRedirect(FRONTEND_URL + "/login?error=discord_not_linked");
                return;
            }
            license = (String) body.get("license");

        } catch (HttpClientErrorException.NotFound e) {
            // 404: el Discord no está registrado en txAdmin
            log.info("Discord ID {} no encontrado en txAdmin", discordId);
            response.sendRedirect(FRONTEND_URL + "/login?error=discord_not_linked");
            return;
        } catch (Exception e) {
            log.error("Error al contactar mgmt-service para discordId={}: {}", discordId, e.getMessage());
            response.sendRedirect(FRONTEND_URL + "/login?error=server_error");
            return;
        }

        // 2. Convertir "license:HASH" → "char1:HASH" (formato que usa ESX Legacy como PK)
        String dbIdentifier = license.startsWith("license:")
                ? "char1:" + license.substring("license:".length())
                : license;

        Optional<User> userOpt = userRepository.findByIdentifier(dbIdentifier);
        if (userOpt.isEmpty()) {
            log.info("Licencia {} no registrada en la BD local", license);
            response.sendRedirect(FRONTEND_URL + "/login?error=player_not_found");
            return;
        }

        // 3. Generar JWT con la licencia como subject
        User user = userOpt.get();
        String role = ("admin".equals(user.getGroup()) || "superadmin".equals(user.getGroup()))
                ? user.getGroup()
                : "user";

        String token = jwtUtil.generateToken(dbIdentifier, role);
        log.info("Login Discord OK — discordId={} identifier={} role={}", discordId, dbIdentifier, role);

        response.sendRedirect(FRONTEND_URL + "/login?token=" + token);
    }
}