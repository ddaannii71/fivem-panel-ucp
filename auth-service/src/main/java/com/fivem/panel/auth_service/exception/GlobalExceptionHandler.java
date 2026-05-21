package com.fivem.panel.auth_service.exception;

import org.springframework.dao.DataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

// Manejador global de excepciones
// Captura los errores que se lanzan en cualquier controlador y devuelve un JSON bonito
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Si hay un fallo de base de datos devuelvo un 503
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, Object>> handleDb(DataAccessException e) {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("error", "Error de base de datos");
        respuesta.put("detail", e.getMessage());
        return ResponseEntity.status(503).body(respuesta);
    }

    // Si pasa cualquier otra cosa, devuelvo un 500
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception e) {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("error", "Error interno del servidor");
        respuesta.put("detail", e.getMessage());
        return ResponseEntity.status(500).body(respuesta);
    }
}
