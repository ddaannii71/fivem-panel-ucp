package com.fivem.panel.auth_service.service;

import com.fivem.panel.auth_service.model.User;
import com.fivem.panel.auth_service.repository.UserRepository;
import com.fivem.panel.auth_service.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    public ResponseEntity<Map<String, Object>> login(String identifier, String password) {
        try {
            Optional<User> userOptional = userRepository.findByIdentifier(identifier);

            if (userOptional.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Usuario no encontrado"));
            }

            User user = userOptional.get();

            if (!password.equals(user.getWebPassword())) {
                return ResponseEntity.status(401).body(Map.of("error", "Contraseña incorrecta"));
            }

            if (!"admin".equalsIgnoreCase(user.getGroup()) && !"superadmin".equalsIgnoreCase(user.getGroup())) {
                return ResponseEntity.status(403).body(Map.of("error", "Acceso denegado: no eres administrador"));
            }

            String token = jwtUtil.generateToken(user.getIdentifier(), user.getGroup());
            return ResponseEntity.ok(Map.of("token", token, "role", user.getGroup()));

        } catch (Exception e) {
            throw new RuntimeException("Error durante el proceso de login", e);
        }
    }
}
