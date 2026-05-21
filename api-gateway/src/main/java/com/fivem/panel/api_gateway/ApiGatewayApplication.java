package com.fivem.panel.api_gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Clase principal del API Gateway
// Es la puerta de entrada de todas las peticiones que vienen del frontend
@SpringBootApplication
public class ApiGatewayApplication {

	// Metodo main para arrancar Spring Boot
	public static void main(String[] args) {
		SpringApplication.run(ApiGatewayApplication.class, args);
	}

}
