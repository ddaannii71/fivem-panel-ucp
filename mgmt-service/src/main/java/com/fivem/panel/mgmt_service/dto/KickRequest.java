package com.fivem.panel.mgmt_service.dto;

// DTO con los datos para expulsar a un jugador
public class KickRequest {

    // El hash de la licencia del jugador (sin el prefijo "license:")
    private String license;

    // Motivo del kick
    private String reason;

    // Constructor vacio
    public KickRequest() {
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
}
