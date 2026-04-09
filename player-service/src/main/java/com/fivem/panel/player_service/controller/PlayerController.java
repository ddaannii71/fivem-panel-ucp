package com.fivem.panel.player_service.controller;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fivem.panel.player_service.dto.EconomyUpdateRequest;
import com.fivem.panel.player_service.model.Player;
import com.fivem.panel.player_service.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * El "Cajero": recibe las peticiones HTTP y devuelve los datos en JSON.
 * Todas las rutas aquí son relativas a /players.
 * Desde fuera (vía Gateway) se accede como /player-service/players/...
 */
@RestController
@RequestMapping("/players")
public class PlayerController {

    @Autowired
    private PlayerRepository playerRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // GET /player-service/players
    // Devuelve la lista completa de jugadores
    @GetMapping
    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }

    // GET /player-service/players/{identifier}
    // ej: /player-service/players/license:admin123
    @GetMapping("/{identifier}")
    public ResponseEntity<Player> getPlayerByIdentifier(@PathVariable String identifier) {
        return playerRepository.findById(identifier)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /player-service/players/group/{group}
    // ej: /player-service/players/group/admin
    @GetMapping("/group/{group}")
    public List<Player> getPlayersByGroup(@PathVariable String group) {
        return playerRepository.findByGroup(group);
    }

    // GET /player-service/players/job/{job}
    // ej: /player-service/players/job/police
    @GetMapping("/job/{job}")
    public List<Player> getPlayersByJob(@PathVariable String job) {
        return playerRepository.findByJob(job);
    }

    // GET /player-service/players/search?name=daniel
    @GetMapping("/search")
    public List<Player> searchByName(@RequestParam String name) {
        return playerRepository.findByFirstnameContainingIgnoreCase(name);
    }

    // PUT /player-service/players/{identifier}/economy
    // Body: { "money": 1500, "bank": 50000 }
    @PutMapping("/{identifier}/economy")
    public ResponseEntity<Player> updateEconomy(
            @PathVariable String identifier,
            @RequestBody EconomyUpdateRequest request) {

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
                        throw new RuntimeException("Error al procesar el campo accounts", e);
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
