package com.fivem.panel.player_service.exception;

// Excepcion que se lanza cuando no se encuentra un vehiculo
public class VehicleNotFoundException extends RuntimeException {

    // Constructor que recibe la matricula y monta el mensaje
    public VehicleNotFoundException(String plate) {
        super("Vehiculo no encontrado: " + plate);
    }
}
