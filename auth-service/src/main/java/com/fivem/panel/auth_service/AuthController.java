package com.fivem.panel.auth_service;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth") // Prefijo para todas las rutas de este archivo
public class AuthController {

    @GetMapping("/test") // La ruta final será /auth/test
    public String check() {
        return "¡Conexión Exitosa! Estás viendo el Auth-Service a través del Gateway.";
    }
}