package com.fivem.panel.mgmt_service.dto;

// DTO con los datos para banear a un jugador
// La duracion puede ser: "permanent", "1 hour", "1 day", "1 week", "1 month", etc.
public class BanRequest {

    // El hash de la licencia del jugador (sin "license:")
    private String license;

    // Motivo del ban
    private String reason;

    // Cuanto dura el ban
    private String duration;

    // Constructor vacio
    public BanRequest() {
    }

    // Getter de la licencia
    public String getLicense() {
        return license;
    }

    // Setter de la licencia
    public void setLicense(String license) {
        this.license = license;
    }

    // Getter del motivo
    public String getReason() {
        return reason;
    }

    // Setter del motivo
    public void setReason(String reason) {
        this.reason = reason;
    }

    // Getter de la duracion
    public String getDuration() {
        return duration;
    }

    // Setter de la duracion
    public void setDuration(String duration) {
        this.duration = duration;
    }
}
