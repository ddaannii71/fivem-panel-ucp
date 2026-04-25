package com.fivem.panel.mgmt_service.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.ResourceAccessException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PlayerNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handlePlayerNotFound(PlayerNotFoundException e) {
        return ResponseEntity.status(404).body(Map.of(
                "error", "Jugador no encontrado",
                "detail", e.getMessage()
        ));
    }

    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<Map<String, Object>> handleServerOffline(ResourceAccessException e) {
        return ResponseEntity.status(503).body(Map.of(
                "error", "No se puede conectar con el servidor FiveM",
                "detail", e.getMessage()
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception e) {
        return ResponseEntity.status(500).body(Map.of(
                "error", "Error interno del servidor",
                "detail", e.getMessage()
        ));
    }
}
