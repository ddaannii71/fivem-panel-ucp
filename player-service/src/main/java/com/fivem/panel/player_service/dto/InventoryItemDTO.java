package com.fivem.panel.player_service.dto;

public class InventoryItemDTO {

    private String name;
    private int count;

    public InventoryItemDTO() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }
}
