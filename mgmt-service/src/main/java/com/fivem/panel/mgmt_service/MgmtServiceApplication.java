package com.fivem.panel.mgmt_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Clase principal del microservicio mgmt-service
// Sirve para hablar con el servidor FiveM y con txAdmin (kick, ban, etc)
@SpringBootApplication
public class MgmtServiceApplication {

	// Metodo main para arrancar Spring Boot
	public static void main(String[] args) {
		SpringApplication.run(MgmtServiceApplication.class, args);
	}
}
