package com.fivem.panel.player_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// Entidad que representa un vehiculo que tiene un jugador
// Mapea la tabla owned_vehicles
@Entity
@Table(name = "owned_vehicles")
public class OwnedVehicle {

    // La matricula es la clave primaria
    @Id
    @Column(length = 8)
    private String plate;

    // El identifier del dueno (ej: char1:abc...)
    @Column(nullable = false, length = 60)
    private String owner;

    // JSON con los datos del vehiculo (modelo, colores, tuneo, etc)
    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String vehicle;

    // Tipo de vehiculo: car, boat, plane, etc.
    @Column(nullable = false, length = 20)
    private String type;

    // Si esta guardado en garaje (true) o fuera (false)
    @Column(nullable = false, columnDefinition = "TINYINT(1)")
    private Boolean stored;

    // En que garaje esta aparcado
    @Column(nullable = true)
    private String parking;

    // Constructor vacio para JPA
    public OwnedVehicle() {
    }

    // Getter de la matricula
    public String getPlate() {
        return plate;
    }

    // Setter de la matricula
    public void setPlate(String plate) {
        this.plate = plate;
    }

    // Getter del dueno
    public String getOwner() {
        return owner;
    }

    // Setter del dueno
    public void setOwner(String owner) {
        this.owner = owner;
    }

    // Getter del JSON del vehiculo
    public String getVehicle() {
        return vehicle;
    }

    // Setter del JSON del vehiculo
    public void setVehicle(String vehicle) {
        this.vehicle = vehicle;
    }

    // Getter del tipo
    public String getType() {
        return type;
    }

    // Setter del tipo
    public void setType(String type) {
        this.type = type;
    }

    // Getter del flag stored
    public Boolean getStored() {
        return stored;
    }

    // Setter del flag stored
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
