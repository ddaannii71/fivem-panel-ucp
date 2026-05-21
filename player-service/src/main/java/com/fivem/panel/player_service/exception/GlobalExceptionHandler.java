package com.fivem.panel.player_service.exception;

import org.springframework.dao.DataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

// Manejador global de excepciones del player-service
// Captura los errores y devuelve un JSON con el codigo HTTP apropiado
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

    // Cuando no se encuentra un vehiculo -> 404
    @ExceptionHandler(VehicleNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleVehicleNotFound(VehicleNotFoundException e) {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("error", "Vehiculo no encontrado");
        respuesta.put("detail", e.getMessage());
        return ResponseEntity.status(404).body(respuesta);
    }

    // Si hay un fallo de base de datos -> 503
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, Object>> handleDb(DataAccessException e) {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("error", "Error de base de datos");
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
