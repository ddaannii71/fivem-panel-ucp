package com.fivem.panel.auth_service.controller;

import com.fivem.panel.auth_service.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth") // Prefijo para todas las rutas de este archivo
public class AuthController {

    // Conectamos el controlador con la lógica de negocio (el AuthService)
    @Autowired
    private AuthService authService;

    // Tu endpoint de prueba original (¡Intacto!)
    @GetMapping("/test") // La ruta final será /auth/test
    public String check() {
        return "¡Conexión Exitosa! Estás viendo el Auth-Service a través del Gateway.";
    }

    // EL NUEVO ENDPOINT DE LOGIN
    // Usamos POST porque estamos enviando datos sensibles (contraseñas)
    @PostMapping("/login")
    public String loginUser(@RequestParam String identifier, @RequestParam String password) {
        return authService.login(identifier, password);
    }
}