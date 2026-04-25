package com.fivem.panel.mgmt_service.controller;

import com.fivem.panel.mgmt_service.dto.BanRequest;
import com.fivem.panel.mgmt_service.dto.KickRequest;
import com.fivem.panel.mgmt_service.exception.PlayerNotFoundException;
import com.fivem.panel.mgmt_service.service.FXServerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class MgmtController {

    private final FXServerService fxServerService;

    public MgmtController(FXServerService fxServerService) {
        this.fxServerService = fxServerService;
    }

    @GetMapping("/server/status")
    public ResponseEntity<Map<String, Object>> getServerStatus() {
        try {
            return ResponseEntity.ok(fxServerService.getServerStatus());
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener estado del servidor", e);
        }
    }

    @PostMapping("/players/kick")
    public ResponseEntity<Map<String, Object>> kickPlayer(@RequestBody KickRequest kickRequest) {
        try {
            return ResponseEntity.ok(fxServerService.kickPlayer(kickRequest.getLicense(), kickRequest.getReason()));
        } catch (Exception e) {
            throw new RuntimeException("Error al expulsar al jugador: " + kickRequest.getLicense(), e);
        }
    }

    @PostMapping("/players/ban")
    public ResponseEntity<Map<String, Object>> banPlayer(@RequestBody BanRequest banRequest) {
        try {
            return ResponseEntity.ok(fxServerService.banPlayer(
                    banRequest.getLicense(),
                    banRequest.getReason(),
                    banRequest.getDuration()
            ));
        } catch (Exception e) {
            throw new RuntimeException("Error al banear al jugador: " + banRequest.getLicense(), e);
        }
    }

    @GetMapping("/players/discord/{discordId}")
    public ResponseEntity<Map<String, Object>> getLicenseByDiscord(@PathVariable String discordId) {
        try {
            String license = fxServerService.findLicenseByDiscordId(discordId);
            return ResponseEntity.ok(Map.of("license", license));
        } catch (PlayerNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error interno al consultar txAdmin: " + e.getMessage()));
        }
    }
}
