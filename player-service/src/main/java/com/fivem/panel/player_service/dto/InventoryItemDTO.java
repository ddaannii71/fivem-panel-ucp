package com.fivem.panel.player_service.dto;

public class InventoryItemDTO {

    private Integer slot;
    private String name;
    private int count;

    public InventoryItemDTO() {}

    public Integer getSlot() { return slot; }
    public void setSlot(Integer slot) { this.slot = slot; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }
}
