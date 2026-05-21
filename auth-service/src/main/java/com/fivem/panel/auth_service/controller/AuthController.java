package com.fivem.panel.auth_service.controller;

import com.fivem.panel.auth_service.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

// Controlador del servicio de autenticacion
// Aqui van los endpoints que el frontend llama para hacer login
@RestController
@RequestMapping("/auth")
public class AuthController {

    // Inyecto el servicio que tiene la logica del login
    @Autowired
    private AuthService authService;

    // Endpoint para probar que el servicio esta vivo
    // GET /auth/test -> devuelve un mensajito
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> check() {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("message", "Auth-Service operativo");
        return ResponseEntity.ok(respuesta);
    }

    // Endpoint para hacer login con usuario y contrasena
    // POST /auth/login?identifier=...&password=...
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(
            @RequestParam String identifier,
            @RequestParam String password) {
        // Llamo al servicio que comprueba todo y me devuelve la respuesta lista
        return authService.login(identifier, password);
    }
}
