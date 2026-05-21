package com.fivem.panel.mgmt_service.controller;

import com.fivem.panel.mgmt_service.dto.BanRequest;
import com.fivem.panel.mgmt_service.dto.KickRequest;
import com.fivem.panel.mgmt_service.exception.PlayerNotFoundException;
import com.fivem.panel.mgmt_service.service.FXServerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

// Controlador del mgmt-service
// Aqui estan los endpoints para gestionar el servidor FiveM y txAdmin
@RestController
public class MgmtController {

    // Inyecto el servicio que habla con FXServer y txAdmin
    @Autowired
    private FXServerService fxServerService;

    // GET /server/status -> devuelve si el server esta online y cuantos jugadores hay
    @GetMapping("/server/status")
    public ResponseEntity<Map<String, Object>> getServerStatus() {
        try {
            Map<String, Object> estado = fxServerService.getServerStatus();
            return ResponseEntity.ok(estado);
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener estado del servidor", e);
        }
    }

    // POST /players/kick -> expulsa a un jugador
    @PostMapping("/players/kick")
    public ResponseEntity<Map<String, Object>> kickPlayer(@RequestBody KickRequest kickRequest) {
        try {
            Map<String, Object> resultado = fxServerService.kickPlayer(
                    kickRequest.getLicense(),
                    kickRequest.getReason());
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            throw new RuntimeException("Error al expulsar al jugador: " + kickRequest.getLicense(), e);
        }
    }

    // POST /players/ban -> banea a un jugador
    @PostMapping("/players/ban")
    public ResponseEntity<Map<String, Object>> banPlayer(@RequestBody BanRequest banRequest) {
        try {
            Map<String, Object> resultado = fxServerService.banPlayer(
                    banRequest.getLicense(),
                    banRequest.getReason(),
                    banRequest.getDuration());
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            throw new RuntimeException("Error al banear al jugador: " + banRequest.getLicense(), e);
        }
    }

    // GET /players/discord/{discordId} -> dado un Discord ID, te dice la licencia FiveM
    @GetMapping("/players/discord/{discordId}")
    public ResponseEntity<Map<String, Object>> getLicenseByDiscord(@PathVariable String discordId) {
        try {
            String license = fxServerService.findLicenseByDiscordId(discordId);
            Map<String, Object> ok = new HashMap<>();
            ok.put("license", license);
            return ResponseEntity.ok(ok);
        } catch (PlayerNotFoundException e) {
            // No se encontro ningun jugador con ese Discord
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            // Otro fallo cualquiera
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error interno al consultar txAdmin: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
