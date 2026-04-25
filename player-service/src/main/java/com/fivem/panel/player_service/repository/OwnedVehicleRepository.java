package com.fivem.panel.player_service.repository;

import com.fivem.panel.player_service.model.OwnedVehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OwnedVehicleRepository extends JpaRepository<OwnedVehicle, String> {

    List<OwnedVehicle> findByOwner(String owner);
}
