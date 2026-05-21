package com.fivem.panel.player_service.dto;

// DTO con los datos para teletransportar a un jugador
public class PositionUpdateRequest {

    // Coordenada X en el mapa
    private Double x;

    // Coordenada Y en el mapa
    private Double y;

    // Coordenada Z (altura)
    private Double z;

    // Hacia donde mira el personaje (en grados)
    private Double heading;

    // Constructor vacio
    public PositionUpdateRequest() {
    }

    // Getter de la X
    public Double getX() {
        return x;
    }

    // Setter de la X
    public void setX(Double x) {
        this.x = x;
    }

    // Getter de la Y
    public Double getY() {
        return y;
    }

    // Setter de la Y
    public void setY(Double y) {
        this.y = y;
    }

    // Getter de la Z
    public Double getZ() {
        return z;
    }

    // Setter de la Z
    public void setZ(Double z) {
        this.z = z;
    }

    // Getter del heading
    public Double getHeading() {
        return heading;
    }

    // Setter del heading
    public void setHeading(Double heading) {
        this.heading = heading;
    }
}
