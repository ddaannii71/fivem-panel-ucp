package com.fivem.panel.auth_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users") // Apunta a tu tabla de FiveM
public class User {

    @Id // Esta es la Primary Key en FiveM (license:...)
    @Column(length = 60)
    private String identifier;

    @Column(nullable = true, length = 16)
    private String firstname;

    @Column(nullable = true, length = 16)
    private String lastname;

    // Hay que poner "group" entre comillas porque es una palabra reservada en SQL
    @Column(name = "`group`", length = 50)
    private String group;

    // Aquí está la contraseña web que añadiste en HeidiSQL
    @Column(name = "web_password")
    private String webPassword;

    // Constructor vacío obligatorio
    public User() {
    }

    // --- GETTERS Y SETTERS ---
    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public String getGroup() {
        return group;
    }

    public void setGroup(String group) {
        this.group = group;
    }

    public String getWebPassword() {
        return webPassword;
    }

    public void setWebPassword(String webPassword) {
        this.webPassword = webPassword;
    }
}