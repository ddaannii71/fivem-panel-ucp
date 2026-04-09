package com.fivem.panel.player_service.repository;

import com.fivem.panel.player_service.model.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * El "Buscador": Spring genera las consultas SQL automáticamente
 * a partir del nombre de los métodos.
 */
@Repository
public interface PlayerRepository extends JpaRepository<Player, String> {

    // Busca todos los jugadores de un grupo (ej: "admin")
    List<Player> findByGroup(String group);

    // Busca todos los jugadores de un trabajo (ej: "police")
    List<Player> findByJob(String job);

    // Busca jugadores por nombre (ignora mayúsculas/minúsculas)
    List<Player> findByFirstnameContainingIgnoreCase(String firstname);
}
