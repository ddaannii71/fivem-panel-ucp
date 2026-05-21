package com.fivem.panel.player_service.repository;

import com.fivem.panel.player_service.model.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// Repositorio para acceder a la tabla users (los jugadores)
// Spring genera las queries SQL solo a partir del nombre de los metodos
@Repository
public interface PlayerRepository extends JpaRepository<Player, String> {

    // Busca todos los jugadores que tengan un grupo concreto (ej: "admin")
    List<Player> findByGroup(String group);

    // Busca todos los jugadores con un trabajo concreto (ej: "police")
    List<Player> findByJob(String job);

    // Busca por nombre ignorando mayusculas y minusculas
    List<Player> findByFirstnameContainingIgnoreCase(String firstname);

    // Busca todos los personajes cuyo identifier termina en un hash dado
    // Ej: si paso "abc123" me devuelve char1:abc123, char2:abc123, etc.
    List<Player> findByIdentifierEndingWith(String licenseHash);
}
