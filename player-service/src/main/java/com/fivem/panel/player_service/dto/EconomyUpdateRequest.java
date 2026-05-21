package com.fivem.panel.player_service.dto;

// DTO con los datos para actualizar la economia de un jugador
// Cualquier campo puede ser null (no se actualiza)
public class EconomyUpdateRequest {

    // Dinero en efectivo
    private Integer money;

    // Dinero del banco
    private Integer bank;

    // Dinero sucio
    private Integer black_money;

    // Constructor vacio que Spring necesita para deserializar el JSON
    public EconomyUpdateRequest() {
    }

    // Getter del dinero en efectivo
    public Integer getMoney() {
        return money;
    }

    // Setter del dinero en efectivo
    public void setMoney(Integer money) {
        this.money = money;
    }

    // Getter del dinero del banco
    public Integer getBank() {
        return bank;
    }

    // Setter del dinero del banco
    public void setBank(Integer bank) {
        this.bank = bank;
    }

    // Getter del dinero sucio
    public Integer getBlack_money() {
        return black_money;
    }

    // Setter del dinero sucio
    public void setBlack_money(Integer black_money) {
        this.black_money = black_money;
    }
}
