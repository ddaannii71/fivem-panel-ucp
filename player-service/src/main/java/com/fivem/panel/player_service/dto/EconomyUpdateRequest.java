package com.fivem.panel.player_service.dto;

public class EconomyUpdateRequest {

    private Integer money;
    private Integer bank;
    private Integer black_money;

    public EconomyUpdateRequest() {}

    public Integer getMoney() { return money; }
    public void setMoney(Integer money) { this.money = money; }

    public Integer getBank() { return bank; }
    public void setBank(Integer bank) { this.bank = bank; }

    public Integer getBlack_money() { return black_money; }
    public void setBlack_money(Integer black_money) { this.black_money = black_money; }
}
