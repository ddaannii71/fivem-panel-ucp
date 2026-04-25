package com.fivem.panel.auth_service.controller;

import com.fivem.panel.auth_service.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> check() {
        return ResponseEntity.ok(Map.of("message", "Auth-Service operativo"));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(
            @RequestParam String identifier,
            @RequestParam String password) {
        return authService.login(identifier, password);
    }
}
