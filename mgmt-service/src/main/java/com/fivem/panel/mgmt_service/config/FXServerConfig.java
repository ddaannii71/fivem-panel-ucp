package com.fivem.panel.mgmt_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

// Configuracion del mgmt-service
// Recoge los datos del application.properties para hablar con el FXServer y con txAdmin
@Configuration
public class FXServerConfig {

    // IP del servidor FiveM
    @Value("${fxserver.ip}")
    private String ip;

    // Puerto del servidor FiveM
    @Value("${fxserver.port}")
    private int port;

    // URL del panel txAdmin
    @Value("${txadmin.base-url}")
    private String txAdminBaseUrl;

    // Usuario de txAdmin
    @Value("${txadmin.username}")
    private String txAdminUsername;

    // Contrasena de txAdmin
    @Value("${txadmin.password}")
    private String txAdminPassword;

    // Getter de la IP del FXServer
    public String getIp() {
        return ip;
    }

    // Getter del puerto del FXServer
    public int getPort() {
        return port;
    }

    // Getter de la URL de txAdmin
    public String getTxAdminBaseUrl() {
        return txAdminBaseUrl;
    }

    // Getter del usuario de txAdmin
    public String getTxAdminUsername() {
        return txAdminUsername;
    }

    // Getter de la contrasena de txAdmin
    public String getTxAdminPassword() {
        return txAdminPassword;
    }

    // Crea un RestTemplate normal para llamar a otros servicios
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
