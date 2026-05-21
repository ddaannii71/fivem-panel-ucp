package com.fivem.panel.player_service.exception;

// Excepcion que se lanza cuando no se encuentra un jugador
public class PlayerNotFoundException extends RuntimeException {

    // Constructor que recibe el identifier y monta el mensaje
    public PlayerNotFoundException(String identifier) {
        super("Jugador no encontrado: " + identifier);
    }
}
