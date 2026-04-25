package com.fivem.panel.player_service.controller;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fivem.panel.player_service.dto.EconomyUpdateRequest;
import com.fivem.panel.player_service.model.OwnedVehicle;
import com.fivem.panel.player_service.model.Player;
import com.fivem.panel.player_service.repository.OwnedVehicleRepository;
import com.fivem.panel.player_service.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/players")
public class PlayerController {

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private OwnedVehicleRepository ownedVehicleRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping
    public ResponseEntity<List<Player>> getAllPlayers() {
        try {
            return ResponseEntity.ok(playerRepository.findAll());
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener jugadores", e);
        }
    }

    @GetMapping("/{identifier}")
    public ResponseEntity<Player> getPlayerByIdentifier(@PathVariable String identifier) {
        try {
            return playerRepository.findById(identifier)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            throw new RuntimeException("Error al buscar jugador: " + identifier, e);
        }
    }

    @GetMapping("/group/{group}")
    public ResponseEntity<List<Player>> getPlayersByGroup(@PathVariable String group) {
        try {
            return ResponseEntity.ok(playerRepository.findByGroup(group));
        } catch (Exception e) {
            throw new RuntimeException("Error al buscar jugadores por grupo: " + group, e);
        }
    }

    @GetMapping("/job/{job}")
    public ResponseEntity<List<Player>> getPlayersByJob(@PathVariable String job) {
        try {
            return ResponseEntity.ok(playerRepository.findByJob(job));
        } catch (Exception e) {
            throw new RuntimeException("Error al buscar jugadores por trabajo: " + job, e);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Player>> searchByName(@RequestParam String name) {
        try {
            return ResponseEntity.ok(playerRepository.findByFirstnameContainingIgnoreCase(name));
        } catch (Exception e) {
            throw new RuntimeException("Error al buscar jugadores por nombre: " + name, e);
        }
    }

    @GetMapping("/{identifier}/vehicles")
    public ResponseEntity<List<OwnedVehicle>> getVehicles(@PathVariable String identifier) {
        try {
            if (!playerRepository.existsById(identifier)) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(ownedVehicleRepository.findByOwner(identifier));
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener vehículos del jugador: " + identifier, e);
        }
    }

    @GetMapping("/{identifier}/inventory")
    public ResponseEntity<Object> getInventory(@PathVariable String identifier) {
        try {
            var opt = playerRepository.findById(identifier);
            if (opt.isEmpty()) return ResponseEntity.notFound().build();
            String raw = opt.get().getInventory();
            if (raw == null || raw.isBlank()) return ResponseEntity.ok(new Object[0]);
            return ResponseEntity.ok(objectMapper.readValue(raw, Object.class));
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener inventario del jugador: " + identifier, e);
        }
    }

    @PutMapping("/{identifier}/economy")
    public ResponseEntity<Player> updateEconomy(
            @PathVariable String identifier,
            @RequestBody EconomyUpdateRequest request) {
        try {
            return playerRepository.findById(identifier)
                    .map(player -> {
                        try {
                            String currentAccounts = player.getAccounts();
                            ObjectNode accountsNode = (currentAccounts != null && !currentAccounts.isBlank())
                                    ? (ObjectNode) objectMapper.readTree(currentAccounts)
                                    : objectMapper.createObjectNode();
                            accountsNode.put("money", request.getMoney());
                            accountsNode.put("bank", request.getBank());
                            player.setAccounts(objectMapper.writeValueAsString(accountsNode));
                            return ResponseEntity.ok(playerRepository.save(player));
                        } catch (Exception e) {
                            throw new RuntimeException("Error al procesar accounts del jugador: " + identifier, e);
                        }
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error al actualizar economía del jugador: " + identifier, e);
        }
    }
}
