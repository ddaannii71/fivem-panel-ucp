package com.fivem.panel.auth_service.service;

import com.fivem.panel.auth_service.model.User;
import com.fivem.panel.auth_service.repository.UserRepository;
import com.fivem.panel.auth_service.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

// Servicio de autenticacion: aqui esta la logica del login
@Service
public class AuthService {

    // El repositorio de usuarios para buscar en la BD
    @Autowired
    private UserRepository userRepository;

    // La utilidad para generar tokens JWT
    @Autowired
    private JwtUtil jwtUtil;

    // Hace el login del usuario
    // Devuelve el token y el rol si todo va bien, o un error si algo falla
    public ResponseEntity<Map<String, Object>> login(String identifier, String password) {
        try {
            // Busco al usuario por su identificador en la base de datos
            Optional<User> userOptional = userRepository.findByIdentifier(identifier);

            // Si no existe devuelvo 404
            if (userOptional.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Usuario no encontrado");
                return ResponseEntity.status(404).body(error);
            }

            // Saco el usuario del Optional
            User user = userOptional.get();

            // Compruebo si la contrasena coincide
            if (!password.equals(user.getWebPassword())) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Contrasena incorrecta");
                return ResponseEntity.status(401).body(error);
            }

            // Compruebo que el usuario sea admin o superadmin (los demas no pueden entrar al panel)
            String grupo = user.getGroup();
            boolean esAdmin = "admin".equalsIgnoreCase(grupo) || "superadmin".equalsIgnoreCase(grupo);
            if (!esAdmin) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Acceso denegado: no eres administrador");
                return ResponseEntity.status(403).body(error);
            }

            // Si todo va bien genero el token JWT y lo devuelvo junto con el rol
            String token = jwtUtil.generateToken(user.getIdentifier(), user.getGroup());
            Map<String, Object> ok = new HashMap<>();
            ok.put("token", token);
            ok.put("role", user.getGroup());
            return ResponseEntity.ok(ok);

        } catch (Exception e) {
            // Si algo se rompe lo lanzo como excepcion para que lo coja el manejador global
            throw new RuntimeException("Error durante el proceso de login", e);
        }
    }
}
