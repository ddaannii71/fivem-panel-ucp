package com.fivem.panel.player_service.repository;

import com.fivem.panel.player_service.model.OwnedVehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// Repositorio para acceder a la tabla owned_vehicles
@Repository
public interface OwnedVehicleRepository extends JpaRepository<OwnedVehicle, String> {

    // Busca todos los vehiculos que pertenecen a un jugador
    List<OwnedVehicle> findByOwner(String owner);
}
