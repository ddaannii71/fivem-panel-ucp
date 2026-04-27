package com.fivem.panel.player_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fivem.panel.player_service.dto.*;
import com.fivem.panel.player_service.exception.PlayerNotFoundException;
import com.fivem.panel.player_service.exception.VehicleNotFoundException;
import com.fivem.panel.player_service.model.OwnedVehicle;
import com.fivem.panel.player_service.model.Player;
import com.fivem.panel.player_service.repository.OwnedVehicleRepository;
import com.fivem.panel.player_service.repository.PlayerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final OwnedVehicleRepository ownedVehicleRepository;
    private final ObjectMapper objectMapper;

    public PlayerService(PlayerRepository playerRepository,
                         OwnedVehicleRepository ownedVehicleRepository,
                         ObjectMapper objectMapper) {
        this.playerRepository = playerRepository;
        this.ownedVehicleRepository = ownedVehicleRepository;
        this.objectMapper = objectMapper;
    }

    // ------------------------------------------------------------------ //
    //  ECONOMÍA  PUT /players/{identifier}/economy                         //
    // ------------------------------------------------------------------ //
    @Transactional
    public Player updateEconomy(String identifier, EconomyUpdateRequest req) {
        Player player = playerRepository.findById(identifier)
                .orElseThrow(() -> new PlayerNotFoundException(identifier));

        try {
            String raw = player.getAccounts();
            ObjectNode node = (raw != null && !raw.isBlank())
                    ? (ObjectNode) objectMapper.readTree(raw)
                    : objectMapper.createObjectNode();

            if (req.getMoney() != null)       node.put("money",       req.getMoney());
            if (req.getBank() != null)        node.put("bank",        req.getBank());
            if (req.getBlack_money() != null) node.put("black_money", req.getBlack_money());

            player.setAccounts(objectMapper.writeValueAsString(node));
        } catch (Exception e) {
            throw new RuntimeException("Error al procesar accounts de " + identifier, e);
        }

        return playerRepository.save(player);
    }

    // ------------------------------------------------------------------ //
    //  INVENTARIO  PUT /players/{identifier}/inventory                     //
    // ------------------------------------------------------------------ //
    @Transactional
    public Player updateInventory(String identifier, List<InventoryItemDTO> items) {
        Player player = playerRepository.findById(identifier)
                .orElseThrow(() -> new PlayerNotFoundException(identifier));

        try {
            ArrayNode arrayNode = objectMapper.createArrayNode();
            for (InventoryItemDTO item : items) {
                ObjectNode itemNode = objectMapper.createObjectNode();
                itemNode.put("name",  item.getName());
                itemNode.put("count", item.getCount());
                arrayNode.add(itemNode);
            }
            player.setInventory(objectMapper.writeValueAsString(arrayNode));
        } catch (Exception e) {
            throw new RuntimeException("Error al procesar inventory de " + identifier, e);
        }

        return playerRepository.save(player);
    }

    // ------------------------------------------------------------------ //
    //  AÑADIR/INCREMENTAR ÍTEM  POST /players/{identifier}/inventory/{name}//
    // ------------------------------------------------------------------ //
    @Transactional
    public Player addInventoryItem(String identifier, String itemName, int count) {
        Player player = playerRepository.findById(identifier)
                .orElseThrow(() -> new PlayerNotFoundException(identifier));

        try {
            String raw = player.getInventory();
            ArrayNode arrayNode = (raw != null && !raw.isBlank())
                    ? (ArrayNode) objectMapper.readTree(raw)
                    : objectMapper.createArrayNode();

            // Buscar si el ítem ya existe y sumar
            boolean found = false;
            for (var node : arrayNode) {
                if (node.path("name").asText().equals(itemName)) {
                    ((ObjectNode) node).put("count", node.path("count").asInt() + count);
                    found = true;
                    break;
                }
            }
            // Si no existe, añadir entrada nueva
            if (!found) {
                ObjectNode newItem = objectMapper.createObjectNode();
                newItem.put("name",  itemName);
                newItem.put("count", count);
                arrayNode.add(newItem);
            }

            player.setInventory(objectMapper.writeValueAsString(arrayNode));
        } catch (Exception e) {
            throw new RuntimeException("Error al añadir ítem al inventario de " + identifier, e);
        }

        return playerRepository.save(player);
    }

    // ------------------------------------------------------------------ //
    //  ELIMINAR ÍTEM  DELETE /players/{identifier}/inventory/{name}        //
    // ------------------------------------------------------------------ //
    @Transactional
    public Player removeInventoryItem(String identifier, String itemName) {
        Player player = playerRepository.findById(identifier)
                .orElseThrow(() -> new PlayerNotFoundException(identifier));

        try {
            String raw = player.getInventory();
            ArrayNode arrayNode = (raw != null && !raw.isBlank())
                    ? (ArrayNode) objectMapper.readTree(raw)
                    : objectMapper.createArrayNode();

            ArrayNode updated = objectMapper.createArrayNode();
            for (var node : arrayNode) {
                if (!node.path("name").asText().equals(itemName)) {
                    updated.add(node);
                }
            }

            player.setInventory(objectMapper.writeValueAsString(updated));
        } catch (Exception e) {
            throw new RuntimeException("Error al eliminar ítem del inventario de " + identifier, e);
        }

        return playerRepository.save(player);
    }

    // ------------------------------------------------------------------ //
    //  POSICIÓN  PUT /players/{identifier}/position                        //
    // ------------------------------------------------------------------ //
    @Transactional
    public Player updatePosition(String identifier, PositionUpdateRequest req) {
        Player player = playerRepository.findById(identifier)
                .orElseThrow(() -> new PlayerNotFoundException(identifier));

        try {
            String raw = player.getPosition();
            ObjectNode node = (raw != null && !raw.isBlank())
                    ? (ObjectNode) objectMapper.readTree(raw)
                    : objectMapper.createObjectNode();

            if (req.getX()       != null) node.put("x",       req.getX());
            if (req.getY()       != null) node.put("y",       req.getY());
            if (req.getZ()       != null) node.put("z",       req.getZ());
            if (req.getHeading() != null) node.put("heading", req.getHeading());

            player.setPosition(objectMapper.writeValueAsString(node));
        } catch (Exception e) {
            throw new RuntimeException("Error al procesar position de " + identifier, e);
        }

        return playerRepository.save(player);
    }

    // ------------------------------------------------------------------ //
    //  VEHÍCULO  PATCH /players/{identifier}/vehicles/{plate}              //
    // ------------------------------------------------------------------ //
    @Transactional
    public OwnedVehicle updateVehicle(String identifier, String plate, VehicleUpdateRequest req) {
        // Verificar que el jugador existe
        if (!playerRepository.existsById(identifier)) {
            throw new PlayerNotFoundException(identifier);
        }

        OwnedVehicle vehicle = ownedVehicleRepository.findById(plate)
                .orElseThrow(() -> new VehicleNotFoundException(plate));

        // Verificar que el vehículo pertenece al jugador
        if (!vehicle.getOwner().equals(identifier)) {
            throw new VehicleNotFoundException(
                    "La matrícula " + plate + " no pertenece al jugador " + identifier);
        }

        if (req.getStored() != null) {
            vehicle.setStored(req.getStored());
        }

        // parking se almacena dentro del JSON de vehicle si aplica
        if (req.getParking() != null) {
            try {
                String raw = vehicle.getVehicle();
                ObjectNode node = (raw != null && !raw.isBlank())
                        ? (ObjectNode) objectMapper.readTree(raw)
                        : objectMapper.createObjectNode();
                node.put("parking", req.getParking());
                vehicle.setVehicle(objectMapper.writeValueAsString(node));
            } catch (Exception e) {
                throw new RuntimeException("Error al procesar vehicle JSON de " + plate, e);
            }
        }

        return ownedVehicleRepository.save(vehicle);
    }
}
