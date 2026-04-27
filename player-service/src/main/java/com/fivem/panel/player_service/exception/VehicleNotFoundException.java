package com.fivem.panel.player_service.exception;

public class VehicleNotFoundException extends RuntimeException {
    public VehicleNotFoundException(String plate) {
        super("Vehículo no encontrado: " + plate);
    }
}
