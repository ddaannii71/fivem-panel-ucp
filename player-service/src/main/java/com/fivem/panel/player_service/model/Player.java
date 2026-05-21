package com.fivem.panel.player_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

// Entidad Player: representa un jugador de la tabla users de ESX Legacy
// Solo mapeo las columnas que el panel UCP necesita, no todas
@Entity
@Table(name = "users")
public class Player {

    // El identifier es la primary key, ej: "license:abc123"
    @Id
    @Column(length = 60)
    private String identifier;

    // Nombre del personaje
    @Column(nullable = true, length = 16)
    private String firstname;

    // Apellido del personaje
    @Column(nullable = true, length = 16)
    private String lastname;

    // Grupo: admin, user, mod, etc.
    // Va entre backticks porque "group" es palabra reservada de SQL
    @Column(name = "`group`", length = 50)
    private String group;

    // Trabajo del jugador (police, ambulance, etc)
    @Column(nullable = true, length = 50)
    private String job;

    // Rango dentro del trabajo
    @Column(name = "job_grade", nullable = true)
    private Integer jobGrade;

    // Fecha de nacimiento del personaje
    @Column(nullable = true, length = 10)
    private String dateofbirth;

    // Sexo del personaje: "m" o "f"
    @Column(nullable = true, length = 1)
    private String sex;

    // Altura del personaje
    @Column(nullable = true)
    private Integer height;

    // Si esta muerto o no
    @Column(name = "is_dead", nullable = true)
    private Boolean isDead;

    // Si esta deshabilitado
    @Column(nullable = true)
    private Boolean disabled;

    // Numero de telefono in-game
    @Column(name = "phone_number", nullable = true, length = 20)
    private String phoneNumber;

    // Cuentas del jugador en formato JSON: {"bank": 5000, "money": 200, "black_money": 0}
    @Column(columnDefinition = "LONGTEXT", nullable = true)
    private String accounts;

    // Inventario del jugador en formato JSON
    @Column(columnDefinition = "LONGTEXT", nullable = true)
    private String inventory;

    // Posicion en el mundo en formato JSON: {"x":0.0,"y":0.0,"z":0.0,"heading":0.0}
    @Column(columnDefinition = "TEXT", nullable = true)
    private String position;

    // Cuando se creo el personaje
    @Column(name = "created_at", nullable = true)
    private LocalDateTime createdAt;

    // Ultima vez que se conecto
    @Column(name = "last_seen", nullable = true)
    private LocalDateTime lastSeen;

    // Constructor vacio para JPA
    public Player() {
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

    // Getter del trabajo
    public String getJob() {
        return job;
    }

    // Setter del trabajo
    public void setJob(String job) {
        this.job = job;
    }

    // Getter del rango de trabajo
    public Integer getJobGrade() {
        return jobGrade;
    }

    // Setter del rango de trabajo
    public void setJobGrade(Integer jobGrade) {
        this.jobGrade = jobGrade;
    }

    // Getter de la fecha de nacimiento
    public String getDateofbirth() {
        return dateofbirth;
    }

    // Setter de la fecha de nacimiento
    public void setDateofbirth(String dateofbirth) {
        this.dateofbirth = dateofbirth;
    }

    // Getter del sexo
    public String getSex() {
        return sex;
    }

    // Setter del sexo
    public void setSex(String sex) {
        this.sex = sex;
    }

    // Getter de la altura
    public Integer getHeight() {
        return height;
    }

    // Setter de la altura
    public void setHeight(Integer height) {
        this.height = height;
    }

    // Getter del flag muerto
    public Boolean getIsDead() {
        return isDead;
    }

    // Setter del flag muerto
    public void setIsDead(Boolean isDead) {
        this.isDead = isDead;
    }

    // Getter del flag deshabilitado
    public Boolean getDisabled() {
        return disabled;
    }

    // Setter del flag deshabilitado
    public void setDisabled(Boolean disabled) {
        this.disabled = disabled;
    }

    // Getter del telefono
    public String getPhoneNumber() {
        return phoneNumber;
    }

    // Setter del telefono
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    // Getter del JSON de cuentas
    public String getAccounts() {
        return accounts;
    }

    // Setter del JSON de cuentas
    public void setAccounts(String accounts) {
        this.accounts = accounts;
    }

    // Getter del JSON de inventario
    public String getInventory() {
        return inventory;
    }

    // Setter del JSON de inventario
    public void setInventory(String inventory) {
        this.inventory = inventory;
    }

    // Getter del JSON de posicion
    public String getPosition() {
        return position;
    }

    // Setter del JSON de posicion
    public void setPosition(String position) {
        this.position = position;
    }

    // Getter de la fecha de creacion
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // Setter de la fecha de creacion
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Getter de la ultima conexion
    public LocalDateTime getLastSeen() {
        return lastSeen;
    }

    // Setter de la ultima conexion
    public void setLastSeen(LocalDateTime lastSeen) {
        this.lastSeen = lastSeen;
    }
}
