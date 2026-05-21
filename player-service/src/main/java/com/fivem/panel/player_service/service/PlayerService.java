package com.fivem.panel.player_service.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fivem.panel.player_service.dto.EconomyUpdateRequest;
import com.fivem.panel.player_service.dto.InventoryItemDTO;
import com.fivem.panel.player_service.dto.PositionUpdateRequest;
import com.fivem.panel.player_service.dto.VehicleUpdateRequest;
import com.fivem.panel.player_service.exception.PlayerNotFoundException;
import com.fivem.panel.player_service.exception.VehicleNotFoundException;
import com.fivem.panel.player_service.model.OwnedVehicle;
import com.fivem.panel.player_service.model.Player;
import com.fivem.panel.player_service.repository.OwnedVehicleRepository;
import com.fivem.panel.player_service.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// Servicio con la logica de modificacion de jugadores
// Aqui esta el "trabajo de verdad" para editar economia, inventario, etc.
@Service
public class PlayerService {

    // Repositorio de jugadores
    @Autowired
    private PlayerRepository playerRepository;

    // Repositorio de vehiculos
    @Autowired
    private OwnedVehicleRepository ownedVehicleRepository;

    // Para parsear y escribir JSON
    @Autowired
    private ObjectMapper objectMapper;

    // Modifica el dinero del jugador (efectivo, banco y dinero sucio)
    // Solo cambia los campos que vengan en el request, los demas se quedan igual
    @Transactional
    public Player updateEconomy(String identifier, EconomyUpdateRequest req) {
        // Busco el jugador, si no existe lanzo excepcion
        Player player = playerRepository.findById(identifier)
                .orElseThrow(() -> new PlayerNotFoundException(identifier));

        try {
            // Cojo el JSON actual de accounts
            String raw = player.getAccounts();
            ObjectNode node;
            if (raw != null && !raw.isBlank()) {
                node = (ObjectNode) objectMapper.readTree(raw);
            } else {
                node = objectMapper.createObjectNode();
            }

            // Voy actualizando solo los campos que llegaron
            if (req.getMoney() != null) {
                node.put("money", req.getMoney());
            }
            if (req.getBank() != null) {
                node.put("bank", req.getBank());
            }
            if (req.getBlack_money() != null) {
                node.put("black_money", req.getBlack_money());
            }

            // Vuelvo a guardar el JSON como String en el jugador
            player.setAccounts(objectMapper.writeValueAsString(node));
        } catch (Exception e) {
            throw new RuntimeException("Error al procesar accounts de " + identifier, e);
        }

        // Guardo en la BD y devuelvo el jugador actualizado
        return playerRepository.save(player);
    }

    // Sobrescribe el inventario completo del jugador
    @Transactional
    public Player updateInventory(String identifier, List<InventoryItemDTO> items) {
        Player player = playerRepository.findById(identifier)
                .orElseThrow(() -> new PlayerNotFoundException(identifier));

        try {
            // Creo un array JSON nuevo desde cero
            ArrayNode arrayNode = objectMapper.createArrayNode();

            // Recorro la lista de items que me llego y los meto en el array
            for (int i = 0; i < items.size(); i++) {
                InventoryItemDTO item = items.get(i);
                ObjectNode itemNode = objectMapper.createObjectNode();

                // Si el item no trae slot, le pongo uno automatico
                int slot;
                if (item.getSlot() != null) {
                    slot = item.getSlot();
                } else {
                    slot = i + 1;
                }

                itemNode.put("slot", slot);
                itemNode.put("name", item.getName());
                itemNode.put("count", item.getCount());
                arrayNode.add(itemNode);
            }

            player.setInventory(objectMapper.writeValueAsString(arrayNode));
        } catch (Exception e) {
            throw new RuntimeException("Error al procesar inventory de " + identifier, e);
        }

        return playerRepository.save(player);
    }

    // Anade un item al inventario o le suma cantidad si ya estaba
    @Transactional
    public Player addInventoryItem(String identifier, String itemName, int count) {
        Player player = playerRepository.findById(identifier)
                .orElseThrow(() -> new PlayerNotFoundException(identifier));

        try {
            String raw = player.getInventory();
            ArrayNode arrayNode;
            if (raw != null && !raw.isBlank()) {
                arrayNode = (ArrayNode) objectMapper.readTree(raw);
            } else {
                arrayNode = objectMapper.createArrayNode();
            }

            // Busco si ya tiene ese item
            boolean encontrado = false;
            for (JsonNode node : arrayNode) {
                if (node.path("name").asText().equals(itemName)) {
                    // Si lo tiene, le sumo la cantidad
                    int actual = node.path("count").asInt();
                    ((ObjectNode) node).put("count", actual + count);
                    encontrado = true;
                    break;
                }
            }

            // Si no lo tenia, le anado uno nuevo en el siguiente slot libre
            if (!encontrado) {
                // Calculo cual es el slot mas alto usado
                int maxSlot = 0;
                for (JsonNode node : arrayNode) {
                    int s = node.path("slot").asInt(0);
                    if (s > maxSlot) {
                        maxSlot = s;
                    }
                }

                ObjectNode newItem = objectMapper.createObjectNode();
                newItem.put("slot", maxSlot + 1);
                newItem.put("name", itemName);
                newItem.put("count", count);
                arrayNode.add(newItem);
            }

            player.setInventory(objectMapper.writeValueAsString(arrayNode));
        } catch (Exception e) {
            throw new RuntimeException("Error al anadir item al inventario de " + identifier, e);
        }

        return playerRepository.save(player);
    }

    // Quita un item del inventario por su nombre
    @Transactional
    public Player removeInventoryItem(String identifier, String itemName) {
        Player player = playerRepository.findById(identifier)
                .orElseThrow(() -> new PlayerNotFoundException(identifier));

        try {
            String raw = player.getInventory();
            ArrayNode arrayNode;
            if (raw != null && !raw.isBlank()) {
                arrayNode = (ArrayNode) objectMapper.readTree(raw);
            } else {
                arrayNode = objectMapper.createArrayNode();
            }

            // Creo un array nuevo sin el item que quiero quitar
            ArrayNode updated = objectMapper.createArrayNode();
            for (JsonNode node : arrayNode) {
                if (!node.path("name").asText().equals(itemName)) {
                    updated.add(node);
                }
            }

            player.setInventory(objectMapper.writeValueAsString(updated));
        } catch (Exception e) {
            throw new RuntimeException("Error al eliminar item del inventario de " + identifier, e);
        }

        return playerRepository.save(player);
    }

    // Cambia la posicion del jugador (teletransporte)
    @Transactional
    public Player updatePosition(String identifier, PositionUpdateRequest req) {
        Player player = playerRepository.findById(identifier)
                .orElseThrow(() -> new PlayerNotFoundException(identifier));

        try {
            String raw = player.getPosition();
            ObjectNode node;
            if (raw != null && !raw.isBlank()) {
                node = (ObjectNode) objectMapper.readTree(raw);
            } else {
                node = objectMapper.createObjectNode();
            }

            // Solo actualizo las coordenadas que vinieron en el request
            if (req.getX() != null) {
                node.put("x", req.getX());
            }
            if (req.getY() != null) {
                node.put("y", req.getY());
            }
            if (req.getZ() != null) {
                node.put("z", req.getZ());
            }
            if (req.getHeading() != null) {
                node.put("heading", req.getHeading());
            }

            player.setPosition(objectMapper.writeValueAsString(node));
        } catch (Exception e) {
            throw new RuntimeException("Error al procesar position de " + identifier, e);
        }

        return playerRepository.save(player);
    }

    // Cambia el estado de un vehiculo (si esta en garaje o fuera)
    @Transactional
    public OwnedVehicle updateVehicle(String identifier, String plate, VehicleUpdateRequest req) {
        // Compruebo que el jugador existe
        if (!playerRepository.existsById(identifier)) {
            throw new PlayerNotFoundException(identifier);
        }

        // Busco el vehiculo por matricula
        OwnedVehicle vehicle = ownedVehicleRepository.findById(plate)
                .orElseThrow(() -> new VehicleNotFoundException(plate));

        // Compruebo que el vehiculo le pertenece a ese jugador
        if (!vehicle.getOwner().equals(identifier)) {
            throw new VehicleNotFoundException(
                    "La matricula " + plate + " no pertenece al jugador " + identifier);
        }

        // Actualizo los campos que vengan en el request
        if (req.getStored() != null) {
            vehicle.setStored(req.getStored());
        }
        if (req.getParking() != null) {
            vehicle.setParking(req.getParking());
        }

        return ownedVehicleRepository.save(vehicle);
    }
}
