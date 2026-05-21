package com.fivem.panel.player_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fivem.panel.player_service.dto.EconomyUpdateRequest;
import com.fivem.panel.player_service.dto.InventoryItemDTO;
import com.fivem.panel.player_service.dto.PositionUpdateRequest;
import com.fivem.panel.player_service.dto.VehicleUpdateRequest;
import com.fivem.panel.player_service.model.OwnedVehicle;
import com.fivem.panel.player_service.model.Player;
import com.fivem.panel.player_service.repository.OwnedVehicleRepository;
import com.fivem.panel.player_service.repository.PlayerRepository;
import com.fivem.panel.player_service.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

// Controlador de los jugadores
// Aqui estan todos los endpoints REST relacionados con personajes, economia, inventario, etc
@RestController
@RequestMapping("/players")
public class PlayerController {

    // Repositorio de jugadores
    @Autowired
    private PlayerRepository playerRepository;

    // Repositorio de vehiculos
    @Autowired
    private OwnedVehicleRepository ownedVehicleRepository;

    // Servicio con la logica de modificacion
    @Autowired
    private PlayerService playerService;

    // Para parsear JSON
    @Autowired
    private ObjectMapper objectMapper;

    // GET /players -> devuelve todos los jugadores
    @GetMapping
    public ResponseEntity<List<Player>> getAllPlayers() {
        List<Player> jugadores = playerRepository.findAll();
        return ResponseEntity.ok(jugadores);
    }

    // GET /players/{identifier} -> busca un jugador por su identifier
    @GetMapping("/{identifier}")
    public ResponseEntity<Player> getPlayerByIdentifier(@PathVariable String identifier) {
        Optional<Player> opt = playerRepository.findById(identifier);
        if (opt.isPresent()) {
            return ResponseEntity.ok(opt.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // GET /players/group/{group} -> busca jugadores por grupo
    @GetMapping("/group/{group}")
    public ResponseEntity<List<Player>> getPlayersByGroup(@PathVariable String group) {
        List<Player> jugadores = playerRepository.findByGroup(group);
        return ResponseEntity.ok(jugadores);
    }

    // GET /players/job/{job} -> busca jugadores por trabajo
    @GetMapping("/job/{job}")
    public ResponseEntity<List<Player>> getPlayersByJob(@PathVariable String job) {
        List<Player> jugadores = playerRepository.findByJob(job);
        return ResponseEntity.ok(jugadores);
    }

    // GET /players/search?name=xxx -> busca jugadores cuyo nombre contenga "xxx"
    @GetMapping("/search")
    public ResponseEntity<List<Player>> searchByName(@RequestParam String name) {
        List<Player> jugadores = playerRepository.findByFirstnameContainingIgnoreCase(name);
        return ResponseEntity.ok(jugadores);
    }

    // GET /players/chars/{licenseHash} -> devuelve todos los personajes de un mismo jugador
    // Un jugador puede tener varios personajes (char1, char2...) con el mismo hash
    @GetMapping("/chars/{licenseHash}")
    public ResponseEntity<List<Player>> getCharsByLicenseHash(@PathVariable String licenseHash) {
        List<Player> personajes = playerRepository.findByIdentifierEndingWith(licenseHash);
        return ResponseEntity.ok(personajes);
    }

    // GET /players/{identifier}/vehicles -> devuelve los vehiculos de un jugador
    @GetMapping("/{identifier}/vehicles")
    public ResponseEntity<List<OwnedVehicle>> getVehicles(@PathVariable String identifier) {
        // Primero compruebo que el jugador existe
        if (!playerRepository.existsById(identifier)) {
            return ResponseEntity.notFound().build();
        }
        // Si existe, devuelvo sus vehiculos
        List<OwnedVehicle> vehiculos = ownedVehicleRepository.findByOwner(identifier);
        return ResponseEntity.ok(vehiculos);
    }

    // GET /players/{identifier}/inventory -> devuelve el inventario de un jugador
    @GetMapping("/{identifier}/inventory")
    public ResponseEntity<Object> getInventory(@PathVariable String identifier) {
        // Busco al jugador
        Optional<Player> opt = playerRepository.findById(identifier);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // El inventario esta guardado como String JSON
        String raw = opt.get().getInventory();
        if (raw == null || raw.isBlank()) {
            // Si esta vacio devuelvo un array vacio
            return ResponseEntity.ok(new Object[0]);
        }

        // Parseo el JSON y lo devuelvo
        try {
            Object parseado = objectMapper.readValue(raw, Object.class);
            return ResponseEntity.ok(parseado);
        } catch (Exception e) {
            throw new RuntimeException("Error al parsear inventario de " + identifier, e);
        }
    }

    // PUT /players/{identifier}/economy -> modifica el dinero del jugador
    @PutMapping("/{identifier}/economy")
    public ResponseEntity<Player> updateEconomy(
            @PathVariable String identifier,
            @RequestBody EconomyUpdateRequest request) {
        Player actualizado = playerService.updateEconomy(identifier, request);
        return ResponseEntity.ok(actualizado);
    }

    // PUT /players/{identifier}/inventory -> sobrescribe el inventario entero
    @PutMapping("/{identifier}/inventory")
    public ResponseEntity<Player> updateInventory(
            @PathVariable String identifier,
            @RequestBody List<InventoryItemDTO> items) {
        Player actualizado = playerService.updateInventory(identifier, items);
        return ResponseEntity.ok(actualizado);
    }

    // POST /players/{identifier}/inventory/{itemName}?count=N -> anade un item al inventario
    @PostMapping("/{identifier}/inventory/{itemName}")
    public ResponseEntity<Player> addInventoryItem(
            @PathVariable String identifier,
            @PathVariable String itemName,
            @RequestParam(defaultValue = "1") int count) {
        Player actualizado = playerService.addInventoryItem(identifier, itemName, count);
        return ResponseEntity.ok(actualizado);
    }

    // DELETE /players/{identifier}/inventory/{itemName} -> quita un item del inventario
    @DeleteMapping("/{identifier}/inventory/{itemName}")
    public ResponseEntity<Player> removeInventoryItem(
            @PathVariable String identifier,
            @PathVariable String itemName) {
        Player actualizado = playerService.removeInventoryItem(identifier, itemName);
        return ResponseEntity.ok(actualizado);
    }

    // PUT /players/{identifier}/position -> cambia la posicion del jugador (teletransporte)
    @PutMapping("/{identifier}/position")
    public ResponseEntity<Player> updatePosition(
            @PathVariable String identifier,
            @RequestBody PositionUpdateRequest request) {
        Player actualizado = playerService.updatePosition(identifier, request);
        return ResponseEntity.ok(actualizado);
    }

    // PATCH /players/{identifier}/vehicles/{plate} -> modifica un vehiculo del jugador
    @PatchMapping("/{identifier}/vehicles/{plate}")
    public ResponseEntity<OwnedVehicle> updateVehicle(
            @PathVariable String identifier,
            @PathVariable String plate,
            @RequestBody VehicleUpdateRequest request) {
        OwnedVehicle actualizado = playerService.updateVehicle(identifier, plate, request);
        return ResponseEntity.ok(actualizado);
    }
}
