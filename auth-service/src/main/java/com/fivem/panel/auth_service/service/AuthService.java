package com.fivem.panel.auth_service.service;

import com.fivem.panel.auth_service.model.User;
import com.fivem.panel.auth_service.repository.UserRepository;
import com.fivem.panel.auth_service.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    // Conectamos nuestra nueva "fábrica de tokens"
    @Autowired
    private JwtUtil jwtUtil;

    public String login(String identifier, String password) {
        Optional<User> userOptional = userRepository.findByIdentifier(identifier);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            if (password.equals(user.getWebPassword())) {
                if ("admin".equalsIgnoreCase(user.getGroup()) || "superadmin".equalsIgnoreCase(user.getGroup())) {

                    // ¡AQUÍ ESTÁ LA MAGIA!
                    // Si todo es correcto, le fabricamos un token con su ID y su Rango
                    String token = jwtUtil.generateToken(user.getIdentifier(), user.getGroup());
                    return token;

                } else {
                    return "Error: Acceso denegado. No eres administrador.";
                }
            } else {
                return "Error: Contraseña incorrecta.";
            }
        } else {
            return "Error: Usuario no encontrado.";
        }
    }
}