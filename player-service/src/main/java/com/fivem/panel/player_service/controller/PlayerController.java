package com.fivem.panel.player_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fivem.panel.player_service.dto.*;
import com.fivem.panel.player_service.model.OwnedVehicle;
import com.fivem.panel.player_service.model.Player;
import com.fivem.panel.player_service.repository.OwnedVehicleRepository;
import com.fivem.panel.player_service.repository.PlayerRepository;
import com.fivem.panel.player_service.service.PlayerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/players")
public class PlayerController {

    private final PlayerRepository playerRepository;
    private final OwnedVehicleRepository ownedVehicleRepository;
    private final PlayerService playerService;
    private final ObjectMapper objectMapper;

    public PlayerController(PlayerRepository playerRepository,
                            OwnedVehicleRepository ownedVehicleRepository,
                            PlayerService playerService,
                            ObjectMapper objectMapper) {
        this.playerRepository = playerRepository;
        this.ownedVehicleRepository = ownedVehicleRepository;
        this.playerService = playerService;
        this.objectMapper = objectMapper;
    }

    // ------------------------------------------------------------------ //
    //  READ endpoints                                                       //
    // ------------------------------------------------------------------ //

    @GetMapping
    public ResponseEntity<List<Player>> getAllPlayers() {
        return ResponseEntity.ok(playerRepository.findAll());
    }

    @GetMapping("/{identifier}")
    public ResponseEntity<Player> getPlayerByIdentifier(@PathVariable String identifier) {
        return playerRepository.findById(identifier)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/group/{group}")
    public ResponseEntity<List<Player>> getPlayersByGroup(@PathVariable String group) {
        return ResponseEntity.ok(playerRepository.findByGroup(group));
    }

    @GetMapping("/job/{job}")
    public ResponseEntity<List<Player>> getPlayersByJob(@PathVariable String job) {
        return ResponseEntity.ok(playerRepository.findByJob(job));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Player>> searchByName(@RequestParam String name) {
        return ResponseEntity.ok(playerRepository.findByFirstnameContainingIgnoreCase(name));
    }

    @GetMapping("/{identifier}/vehicles")
    public ResponseEntity<List<OwnedVehicle>> getVehicles(@PathVariable String identifier) {
        if (!playerRepository.existsById(identifier)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ownedVehicleRepository.findByOwner(identifier));
    }

    @GetMapping("/{identifier}/inventory")
    public ResponseEntity<Object> getInventory(@PathVariable String identifier) {
        var opt = playerRepository.findById(identifier);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        String raw = opt.get().getInventory();
        if (raw == null || raw.isBlank()) return ResponseEntity.ok(new Object[0]);
        try {
            return ResponseEntity.ok(objectMapper.readValue(raw, Object.class));
        } catch (Exception e) {
            throw new RuntimeException("Error al parsear inventario de " + identifier, e);
        }
    }

    // ------------------------------------------------------------------ //
    //  ADMIN: modificar economía                                            //
    //  PUT /players/{identifier}/economy                                    //
    // ------------------------------------------------------------------ //
    @PutMapping("/{identifier}/economy")
    public ResponseEntity<Player> updateEconomy(
            @PathVariable String identifier,
            @RequestBody EconomyUpdateRequest request) {
        return ResponseEntity.ok(playerService.updateEconomy(identifier, request));
    }

    // ------------------------------------------------------------------ //
    //  ADMIN: sobreescribir inventario completo                             //
    //  PUT /players/{identifier}/inventory                                  //
    // ------------------------------------------------------------------ //
    @PutMapping("/{identifier}/inventory")
    public ResponseEntity<Player> updateInventory(
            @PathVariable String identifier,
            @RequestBody List<InventoryItemDTO> items) {
        return ResponseEntity.ok(playerService.updateInventory(identifier, items));
    }

    // ------------------------------------------------------------------ //
    //  ADMIN: añadir/incrementar ítem                                       //
    //  POST /players/{identifier}/inventory/{itemName}?count=N              //
    // ------------------------------------------------------------------ //
    @PostMapping("/{identifier}/inventory/{itemName}")
    public ResponseEntity<Player> addInventoryItem(
            @PathVariable String identifier,
            @PathVariable String itemName,
            @RequestParam(defaultValue = "1") int count) {
        return ResponseEntity.ok(playerService.addInventoryItem(identifier, itemName, count));
    }

    // ------------------------------------------------------------------ //
    //  ADMIN: eliminar ítem                                                 //
    //  DELETE /players/{identifier}/inventory/{itemName}                    //
    // ------------------------------------------------------------------ //
    @DeleteMapping("/{identifier}/inventory/{itemName}")
    public ResponseEntity<Player> removeInventoryItem(
            @PathVariable String identifier,
            @PathVariable String itemName) {
        return ResponseEntity.ok(playerService.removeInventoryItem(identifier, itemName));
    }

    // ------------------------------------------------------------------ //
    //  ADMIN: modificar posición                                            //
    //  PUT /players/{identifier}/position                                   //
    // ------------------------------------------------------------------ //
    @PutMapping("/{identifier}/position")
    public ResponseEntity<Player> updatePosition(
            @PathVariable String identifier,
            @RequestBody PositionUpdateRequest request) {
        return ResponseEntity.ok(playerService.updatePosition(identifier, request));
    }

    // ------------------------------------------------------------------ //
    //  ADMIN: modificar estado de vehículo                                  //
    //  PATCH /players/{identifier}/vehicles/{plate}                         //
    // ------------------------------------------------------------------ //
    @PatchMapping("/{identifier}/vehicles/{plate}")
    public ResponseEntity<OwnedVehicle> updateVehicle(
            @PathVariable String identifier,
            @PathVariable String plate,
            @RequestBody VehicleUpdateRequest request) {
        return ResponseEntity.ok(playerService.updateVehicle(identifier, plate, request));
    }
}
