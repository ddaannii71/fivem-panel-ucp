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

// Servicio principal de logica de negocio del Player Service.
// Gestiona la modificacion de economia, inventario, posicion y vehiculos
// de los jugadores directamente sobre la base de datos del servidor FiveM.
@Service
public class PlayerService {

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private OwnedVehicleRepository ownedVehicleRepository;

    @Autowired
    private ObjectMapper objectMapper;

    // El metodo actualiza el saldo economico del jugador identificado por su identifier de ESX.
    // En ESX Legacy, los datos de economia se almacenan como una cadena JSON dentro de una columna
    // VARCHAR de la tabla users. El metodo deserializa ese JSON, sobreescribe unicamente los campos
    // que hayan llegado en la peticion (dinero en mano, banco o dinero negro) y serializa
    // el resultado de vuelta antes de persistirlo en la base de datos.
    @Transactional
    public Player updateEconomy(String identifier, EconomyUpdateRequest req) {
        Player player = playerRepository.findById(identifier)
                .orElseThrow(() -> new PlayerNotFoundException(identifier));

        try {
            String raw = player.getAccounts();
            ObjectNode node;
            if (raw != null && !raw.isBlank()) {
                node = (ObjectNode) objectMapper.readTree(raw);
            } else {
                node = objectMapper.createObjectNode();
            }

            if (req.getMoney() != null) {
                node.put("money", req.getMoney());
            }
            if (req.getBank() != null) {
                node.put("bank", req.getBank());
            }
            if (req.getBlack_money() != null) {
                node.put("black_money", req.getBlack_money());
            }

            player.setAccounts(objectMapper.writeValueAsString(node));
        } catch (Exception e) {
            throw new RuntimeException("Error al procesar accounts de " + identifier, e);
        }

        return playerRepository.save(player);
    }

    // El metodo reemplaza por completo el inventario del jugador con la lista de items recibida.
    // Construye un nuevo array JSON desde cero: por cada item de la lista genera un nodo
    // con su nombre, cantidad y slot. Si el item no especifica slot, el metodo le asigna
    // uno automatico basado en su posicion en la lista. El array resultante se serializa
    // y se almacena en el campo inventory de la tabla users de ESX.
    @Transactional
    public Player updateInventory(String identifier, List<InventoryItemDTO> items) {
        Player player = playerRepository.findById(identifier)
                .orElseThrow(() -> new PlayerNotFoundException(identifier));

        try {
            ArrayNode arrayNode = objectMapper.createArrayNode();

            for (int i = 0; i < items.size(); i++) {
                InventoryItemDTO item = items.get(i);
                ObjectNode itemNode = objectMapper.createObjectNode();

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

    // El metodo anade un item al inventario del jugador o incrementa su cantidad si ya existe.
    // Primero recorre el array JSON del inventario buscando un nodo cuyo campo name coincida
    // con el item solicitado. Si lo encuentra, suma la cantidad indicada al valor actual.
    // Si no existe ningun nodo con ese nombre, calcula el slot mas alto ocupado en el inventario
    // y crea un nuevo nodo en el slot siguiente, evitando colisiones con items ya existentes.
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

            boolean encontrado = false;
            for (JsonNode node : arrayNode) {
                if (node.path("name").asText().equals(itemName)) {
                    int actual = node.path("count").asInt();
                    ((ObjectNode) node).put("count", actual + count);
                    encontrado = true;
                    break;
                }
            }

            if (!encontrado) {
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

    // El metodo elimina un item del inventario del jugador buscandolo por su nombre.
    // Recorre el array JSON del inventario y construye uno nuevo excluyendo cualquier nodo
    // cuyo campo name coincida con el nombre recibido. El array filtrado se serializa
    // y se persiste en la base de datos, dejando el resto del inventario intacto.
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

    // El metodo modifica las coordenadas de spawn del jugador en el mundo de GTA V,
    // lo que en el contexto del panel equivale a un teletransporte administrativo.
    // En ESX, la posicion se guarda como un objeto JSON con los campos x, y, z y heading.
    // El metodo deserializa ese objeto, actualiza solo las coordenadas presentes en la
    // peticion y vuelve a serializar el resultado antes de guardarlo en la base de datos.
    // El cambio tiene efecto la proxima vez que el jugador cargue el personaje en el servidor.
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

    // El metodo actualiza el estado de un vehiculo concreto perteneciente a un jugador.
    // Primero verifica que el jugador existe en la base de datos y despues localiza el
    // vehiculo por su matricula en la tabla owned_vehicles. Antes de aplicar ningun cambio
    // comprueba que el propietario registrado en el vehiculo coincide con el identifier
    // recibido, evitando que un administrador modifique por error un vehiculo de otro jugador.
    // Los campos actualizables son el estado de garaje (stored) y la ubicacion de aparcamiento.
    @Transactional
    public OwnedVehicle updateVehicle(String identifier, String plate, VehicleUpdateRequest req) {
        if (!playerRepository.existsById(identifier)) {
            throw new PlayerNotFoundException(identifier);
        }

        OwnedVehicle vehicle = ownedVehicleRepository.findById(plate)
                .orElseThrow(() -> new VehicleNotFoundException(plate));

        if (!vehicle.getOwner().equals(identifier)) {
            throw new VehicleNotFoundException(
                    "La matricula " + plate + " no pertenece al jugador " + identifier);
        }

        if (req.getStored() != null) {
            vehicle.setStored(req.getStored());
        }
        if (req.getParking() != null) {
            vehicle.setParking(req.getParking());
        }

        return ownedVehicleRepository.save(vehicle);
    }
}
