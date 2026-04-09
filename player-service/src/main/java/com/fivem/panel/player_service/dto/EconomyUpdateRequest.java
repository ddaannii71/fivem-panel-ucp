package com.fivem.panel.player_service.dto;

public class EconomyUpdateRequest {

    private int money;
    private int bank;

    public EconomyUpdateRequest() {}

    public int getMoney() { return money; }
    public void setMoney(int money) { this.money = money; }

    public int getBank() { return bank; }
    public void setBank(int bank) { this.bank = bank; }
}
