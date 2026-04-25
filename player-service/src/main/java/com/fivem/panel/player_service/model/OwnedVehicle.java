package com.fivem.panel.player_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "owned_vehicles")
public class OwnedVehicle {

    @Id
    @Column(length = 8)
    private String plate;

    @Column(nullable = false, length = 60)
    private String owner;

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String vehicle;

    @Column(nullable = false, length = 20)
    private String type;

    @Column(nullable = false, columnDefinition = "TINYINT(1)")
    private Boolean stored;

    public OwnedVehicle() {}

    public String getPlate()   { return plate; }
    public void setPlate(String plate) { this.plate = plate; }

    public String getOwner()   { return owner; }
    public void setOwner(String owner) { this.owner = owner; }

    public String getVehicle() { return vehicle; }
    public void setVehicle(String vehicle) { this.vehicle = vehicle; }

    public String getType()    { return type; }
    public void setType(String type) { this.type = type; }

    public Boolean getStored() { return stored; }
    public void setStored(Boolean stored) { this.stored = stored; }
}
