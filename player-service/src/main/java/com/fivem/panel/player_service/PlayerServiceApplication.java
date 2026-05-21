package com.fivem.panel.player_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Clase principal del microservicio player-service
// Maneja todo lo relacionado con los jugadores: economia, inventario, vehiculos...
@SpringBootApplication
public class PlayerServiceApplication {

	// Metodo main para arrancar Spring Boot
	public static void main(String[] args) {
		SpringApplication.run(PlayerServiceApplication.class, args);
	}

}
