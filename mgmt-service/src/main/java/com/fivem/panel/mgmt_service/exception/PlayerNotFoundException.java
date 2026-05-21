package com.fivem.panel.mgmt_service.exception;

// Excepcion para cuando no se encuentra un jugador en txAdmin
public class PlayerNotFoundException extends RuntimeException {

    // Constructor que recibe directamente el mensaje
    public PlayerNotFoundException(String message) {
        super(message);
    }
}
