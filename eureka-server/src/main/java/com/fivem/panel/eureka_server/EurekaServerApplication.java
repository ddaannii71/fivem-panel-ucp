package com.fivem.panel.eureka_server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

// Servidor Eureka: el registro de microservicios
// Aqui se apuntan todos los servicios para que se puedan encontrar entre ellos
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {

	// Metodo main para arrancar Spring Boot
	public static void main(String[] args) {
		SpringApplication.run(EurekaServerApplication.class, args);
	}

}
