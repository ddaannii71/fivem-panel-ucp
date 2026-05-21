package com.fivem.panel.player_service.dto;

// DTO que representa un item del inventario
public class InventoryItemDTO {

    // Numero de slot donde esta el item
    private Integer slot;

    // Nombre del item (ej: "water", "bread")
    private String name;

    // Cuantas unidades hay
    private int count;

    // Constructor vacio
    public InventoryItemDTO() {
    }

    // Getter del slot
    public Integer getSlot() {
        return slot;
    }

    // Setter del slot
    public void setSlot(Integer slot) {
        this.slot = slot;
    }

    // Getter del nombre
    public String getName() {
        return name;
    }

    // Setter del nombre
    public void setName(String name) {
        this.name = name;
    }

    // Getter de la cantidad
    public int getCount() {
        return count;
    }

    // Setter de la cantidad
    public void setCount(int count) {
        this.count = count;
    }
}
