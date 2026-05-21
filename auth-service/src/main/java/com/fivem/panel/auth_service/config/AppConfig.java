package com.fivem.panel.auth_service.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

// Aqui declaro beans generales que se usan en toda la app
@Configuration
public class AppConfig {

    // Crea un RestTemplate con balanceo de carga
    // Lo uso para llamar a otros microservicios por su nombre en Eureka
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
