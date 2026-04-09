package com.fivem.panel.mgmt_service.controller;

import com.fivem.panel.mgmt_service.dto.BanRequest;
import com.fivem.panel.mgmt_service.dto.KickRequest;
import com.fivem.panel.mgmt_service.service.FXServerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Rutas internas del servicio (el Gateway ya elimina el prefijo /mgmt-service).
 * Desde fuera se accede como /mgmt-service/server/status, etc.
 */
@RestController
public class MgmtController {

    private final FXServerService fxServerService;

    public MgmtController(FXServerService fxServerService) {
        this.fxServerService = fxServerService;
    }

    // GET /mgmt-service/server/status
    @GetMapping("/server/status")
    public ResponseEntity<Map<String, Object>> getServerStatus() {
        return ResponseEntity.ok(fxServerService.getServerStatus());
    }

    // POST /mgmt-service/players/kick
    // Body: { "license": "04a66f...", "reason": "Motivo" }
    @PostMapping("/players/kick")
    public ResponseEntity<Map<String, Object>> kickPlayer(@RequestBody KickRequest kickRequest) {
        return ResponseEntity.ok(fxServerService.kickPlayer(kickRequest.getLicense(), kickRequest.getReason()));
    }

    // POST /mgmt-service/players/ban
    // Body: { "license": "04a66f...", "reason": "Motivo", "duration": "1 day" }
    @PostMapping("/players/ban")
    public ResponseEntity<Map<String, Object>> banPlayer(@RequestBody BanRequest banRequest) {
        return ResponseEntity.ok(fxServerService.banPlayer(
                banRequest.getLicense(),
                banRequest.getReason(),
                banRequest.getDuration()
        ));
    }
}
