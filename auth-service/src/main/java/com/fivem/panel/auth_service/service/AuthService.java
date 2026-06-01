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

// Servicio principal de autenticacion. Contiene la logica de negocio del login tradicional.
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // El metodo recibe el identificador de ESX y la contrasena web del jugador.
    // Primero verifica que el usuario existe en la base de datos del servidor FiveM.
    // A continuacion comprueba que la contrasena coincide y que el jugador
    // pertenece al grupo admin o superadmin, ya que el resto de jugadores
    // no tienen permiso para acceder al panel de control.
    // Si todas las validaciones son correctas, genera un token JWT firmado
    // que incluye el identificador y el rol del usuario, y lo devuelve junto
    // con el nombre del grupo para que el frontend pueda redirigir al panel correcto.
    public ResponseEntity<Map<String, Object>> login(String identifier, String password) {
        try {
            Optional<User> userOptional = userRepository.findByIdentifier(identifier);

            if (userOptional.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Usuario no encontrado");
                return ResponseEntity.status(404).body(error);
            }

            User user = userOptional.get();

            if (!password.equals(user.getWebPassword())) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Contrasena incorrecta");
                return ResponseEntity.status(401).body(error);
            }

            String grupo = user.getGroup();
            boolean esAdmin = "admin".equalsIgnoreCase(grupo) || "superadmin".equalsIgnoreCase(grupo);
            if (!esAdmin) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Acceso denegado: no eres administrador");
                return ResponseEntity.status(403).body(error);
            }

            String token = jwtUtil.generateToken(user.getIdentifier(), user.getGroup());
            Map<String, Object> ok = new HashMap<>();
            ok.put("token", token);
            ok.put("role", user.getGroup());
            return ResponseEntity.ok(ok);

        } catch (Exception e) {
            throw new RuntimeException("Error durante el proceso de login", e);
        }
    }
}
