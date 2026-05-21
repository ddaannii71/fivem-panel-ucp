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

// Configuracion de Spring Security para el auth-service
// Tambien gestiona el login con Discord (OAuth2)
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Logger para imprimir mensajes en consola
    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    // URL del frontend a la que redirigimos despues del login
    private static final String FRONTEND_URL = "http://localhost:3000";

    // URL del mgmt-service que nos dice que licencia tiene un Discord ID
    private static final String MGMT_DISCORD_URL = "http://MGMT-SERVICE/players/discord/{discordId}";

    // Dependencias que necesitamos para el login con Discord
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    // Constructor con todas las dependencias inyectadas
    public SecurityConfig(JwtUtil jwtUtil, UserRepository userRepository, RestTemplate restTemplate) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.restTemplate = restTemplate;
    }

    // Configura las reglas de seguridad de Spring
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

    // Lo que pasa cuando un usuario hace login con Discord correctamente
    // 1) Le pregunto a mgmt-service que licencia FiveM tiene ese Discord ID
    // 2) Busco esa licencia en la BD local
    // 3) Genero un JWT y redirijo al frontend con el token
    @SuppressWarnings("unchecked")
    private void discordSuccessHandler(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException {

        // Saco el usuario OAuth de Discord y su ID
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String discordId = oauthUser.getAttribute("id");

        // PASO 1: pedirle al mgmt-service la licencia FiveM asociada al Discord ID
        String license;
        try {
            ResponseEntity<Map> mgmtResponse = restTemplate.getForEntity(
                    MGMT_DISCORD_URL, Map.class, discordId);

            Map<String, Object> body = mgmtResponse.getBody();
            // Si no hay licencia, redirijo con error
            if (body == null || !body.containsKey("license")) {
                log.warn("mgmt-service no devolvio licencia para discordId={}", discordId);
                response.sendRedirect(FRONTEND_URL + "/login?error=discord_not_linked");
                return;
            }
            license = (String) body.get("license");

        } catch (HttpClientErrorException.NotFound e) {
            // El Discord no esta registrado en txAdmin
            log.info("Discord ID {} no encontrado en txAdmin", discordId);
            response.sendRedirect(FRONTEND_URL + "/login?error=discord_not_linked");
            return;
        } catch (Exception e) {
            // Cualquier otro fallo de conexion
            log.error("Error al contactar mgmt-service para discordId={}: {}", discordId, e.getMessage());
            response.sendRedirect(FRONTEND_URL + "/login?error=server_error");
            return;
        }

        // PASO 2: convertir "license:HASH" -> "char1:HASH" porque asi es como ESX guarda la PK
        String dbIdentifier;
        if (license.startsWith("license:")) {
            dbIdentifier = "char1:" + license.substring("license:".length());
        } else {
            dbIdentifier = license;
        }

        // Busco el usuario en la BD local
        Optional<User> userOpt = userRepository.findByIdentifier(dbIdentifier);
        if (userOpt.isEmpty()) {
            log.info("Licencia {} no registrada en la BD local", license);
            response.sendRedirect(FRONTEND_URL + "/login?error=player_not_found");
            return;
        }

        // PASO 3: genero el JWT con el rol correspondiente
        User user = userOpt.get();
        String grupo = user.getGroup();
        String role;
        if ("admin".equals(grupo) || "superadmin".equals(grupo)) {
            role = grupo;
        } else {
            role = "user";
        }

        String token = jwtUtil.generateToken(dbIdentifier, role);
        log.info("Login Discord OK - discordId={} identifier={} role={}", discordId, dbIdentifier, role);

        // Redirijo al frontend pasando el token por la URL
        response.sendRedirect(FRONTEND_URL + "/login?token=" + token);
    }
}
