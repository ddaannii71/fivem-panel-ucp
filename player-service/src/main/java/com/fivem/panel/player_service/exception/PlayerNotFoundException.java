package com.fivem.panel.player_service.exception;

public class PlayerNotFoundException extends RuntimeException {
    public PlayerNotFoundException(String identifier) {
        super("Jugador no encontrado: " + identifier);
    }
}
