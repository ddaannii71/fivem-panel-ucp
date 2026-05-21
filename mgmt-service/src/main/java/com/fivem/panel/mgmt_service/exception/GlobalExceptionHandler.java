package com.fivem.panel.mgmt_service.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.ResourceAccessException;

import java.util.HashMap;
import java.util.Map;

// Manejador global de excepciones del mgmt-service
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Cuando no se encuentra un jugador -> 404
    @ExceptionHandler(PlayerNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handlePlayerNotFound(PlayerNotFoundException e) {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("error", "Jugador no encontrado");
        respuesta.put("detail", e.getMessage());
        return ResponseEntity.status(404).body(respuesta);
    }

    // Si no se puede conectar al FXServer -> 503
    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<Map<String, Object>> handleServerOffline(ResourceAccessException e) {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("error", "No se puede conectar con el servidor FiveM");
        respuesta.put("detail", e.getMessage());
        return ResponseEntity.status(503).body(respuesta);
    }

    // Cualquier otro error -> 500
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception e) {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("error", "Error interno del servidor");
        respuesta.put("detail", e.getMessage());
        return ResponseEntity.status(500).body(respuesta);
    }
}
