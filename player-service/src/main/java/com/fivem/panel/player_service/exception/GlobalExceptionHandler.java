package com.fivem.panel.player_service.exception;

import org.springframework.dao.DataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

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

    @ExceptionHandler(VehicleNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleVehicleNotFound(VehicleNotFoundException e) {
        return ResponseEntity.status(404).body(Map.of(
                "error", "Vehículo no encontrado",
                "detail", e.getMessage()
        ));
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, Object>> handleDb(DataAccessException e) {
        return ResponseEntity.status(503).body(Map.of(
                "error", "Error de base de datos",
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
