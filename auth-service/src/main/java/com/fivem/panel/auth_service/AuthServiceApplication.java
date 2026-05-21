package com.fivem.panel.auth_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Clase principal del microservicio auth-service
// Aqui empieza todo cuando se arranca con java -jar
@SpringBootApplication
public class AuthServiceApplication {

	// Metodo main que arranca Spring Boot
	public static void main(String[] args) {
		SpringApplication.run(AuthServiceApplication.class, args);
	}

}
