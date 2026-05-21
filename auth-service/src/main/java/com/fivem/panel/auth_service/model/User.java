package com.fivem.panel.auth_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// Entidad User: representa la tabla "users" de FiveM
// La uso para hacer login
@Entity
@Table(name = "users")
public class User {

    // El identifier es la primary key, formato "license:xxxx" o "char1:xxxx"
    @Id
    @Column(length = 60)
    private String identifier;

    // Nombre del personaje
    @Column(nullable = true, length = 16)
    private String firstname;

    // Apellido del personaje
    @Column(nullable = true, length = 16)
    private String lastname;

    // El grupo del usuario (admin, user, etc)
    // group es palabra reservada de SQL, por eso van los backticks
    @Column(name = "`group`", length = 50)
    private String group;

    // La contrasena para el panel web (la anadi a mano en HeidiSQL)
    @Column(name = "web_password")
    private String webPassword;

    // Constructor vacio que JPA necesita
    public User() {
    }

    // Getter del identifier
    public String getIdentifier() {
        return identifier;
    }

    // Setter del identifier
    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    // Getter del nombre
    public String getFirstname() {
        return firstname;
    }

    // Setter del nombre
    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    // Getter del apellido
    public String getLastname() {
        return lastname;
    }

    // Setter del apellido
    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    // Getter del grupo
    public String getGroup() {
        return group;
    }

    // Setter del grupo
    public void setGroup(String group) {
        this.group = group;
    }

    // Getter de la contrasena web
    public String getWebPassword() {
        return webPassword;
    }

    // Setter de la contrasena web
    public void setWebPassword(String webPassword) {
        this.webPassword = webPassword;
    }
}
