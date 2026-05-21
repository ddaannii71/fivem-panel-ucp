package com.fivem.panel.player_service.dto;

// DTO para actualizar un vehiculo (guardarlo en garaje o sacarlo)
public class VehicleUpdateRequest {

    // True = guardado en garaje, False = fuera
    private Boolean stored;

    // Nombre del garaje donde se guarda
    private String parking;

    // Constructor vacio
    public VehicleUpdateRequest() {
    }

    // Getter de stored
    public Boolean getStored() {
        return stored;
    }

    // Setter de stored
    public void setStored(Boolean stored) {
        this.stored = stored;
    }

    // Getter del garaje
    public String getParking() {
        return parking;
    }

    // Setter del garaje
    public void setParking(String parking) {
        this.parking = parking;
    }
}
