package com.fivem.panel.player_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Molde de la tabla "users" de ESX Legacy.
 * Mapeamos solo las columnas que necesita el panel UCP.
 */
@Entity
@Table(name = "users")
public class Player {

    // --- Identificación ---
    @Id
    @Column(length = 60)
    private String identifier; // ej: license:abc123

    @Column(nullable = true, length = 16)
    private String firstname;

    @Column(nullable = true, length = 16)
    private String lastname;

    @Column(name = "`group`", length = 50)
    private String group; // admin, user, mod... (reservada en SQL, necesita backticks)

    // --- Trabajo ---
    @Column(nullable = true, length = 50)
    private String job;

    @Column(name = "job_grade", nullable = true)
    private Integer jobGrade;

    // --- Datos personales del personaje ---
    @Column(nullable = true, length = 10)
    private String dateofbirth;

    @Column(nullable = true, length = 1)
    private String sex;

    @Column(nullable = true)
    private Integer height;

    // --- Estado en el servidor ---
    @Column(name = "is_dead", nullable = true)
    private Boolean isDead;

    @Column(nullable = true)
    private Boolean disabled;

    @Column(name = "phone_number", nullable = true, length = 20)
    private String phoneNumber;

    // --- Economía (JSON de ESX) ---
    @Column(columnDefinition = "LONGTEXT", nullable = true)
    private String accounts; // {"bank": 5000, "money": 200, ...}

    // --- Timestamps ---
    @Column(name = "created_at", nullable = true)
    private java.time.LocalDateTime createdAt;

    @Column(name = "last_seen", nullable = true)
    private java.time.LocalDateTime lastSeen;

    // Constructor vacío obligatorio para JPA
    public Player() {
    }

    // --- GETTERS Y SETTERS ---

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }

    public String getFirstname() { return firstname; }
    public void setFirstname(String firstname) { this.firstname = firstname; }

    public String getLastname() { return lastname; }
    public void setLastname(String lastname) { this.lastname = lastname; }

    public String getGroup() { return group; }
    public void setGroup(String group) { this.group = group; }

    public String getJob() { return job; }
    public void setJob(String job) { this.job = job; }

    public Integer getJobGrade() { return jobGrade; }
    public void setJobGrade(Integer jobGrade) { this.jobGrade = jobGrade; }

    public String getDateofbirth() { return dateofbirth; }
    public void setDateofbirth(String dateofbirth) { this.dateofbirth = dateofbirth; }

    public String getSex() { return sex; }
    public void setSex(String sex) { this.sex = sex; }

    public Integer getHeight() { return height; }
    public void setHeight(Integer height) { this.height = height; }

    public Boolean getIsDead() { return isDead; }
    public void setIsDead(Boolean isDead) { this.isDead = isDead; }

    public Boolean getDisabled() { return disabled; }
    public void setDisabled(Boolean disabled) { this.disabled = disabled; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getAccounts() { return accounts; }
    public void setAccounts(String accounts) { this.accounts = accounts; }

    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }

    public java.time.LocalDateTime getLastSeen() { return lastSeen; }
    public void setLastSeen(java.time.LocalDateTime lastSeen) { this.lastSeen = lastSeen; }
}
