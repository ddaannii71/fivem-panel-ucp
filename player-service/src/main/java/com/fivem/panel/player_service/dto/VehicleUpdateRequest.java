package com.fivem.panel.player_service.dto;

public class VehicleUpdateRequest {

    private Boolean stored;
    private String parking;

    public VehicleUpdateRequest() {}

    public Boolean getStored() { return stored; }
    public void setStored(Boolean stored) { this.stored = stored; }

    public String getParking() { return parking; }
    public void setParking(String parking) { this.parking = parking; }
}
