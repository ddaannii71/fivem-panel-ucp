package com.fivem.panel.mgmt_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class FXServerConfig {

    // --- FXServer nativo (info.json / players.json) ---
    @Value("${fxserver.ip}")
    private String ip;

    @Value("${fxserver.port}")
    private int port;

    // --- txAdmin API (kick y otros comandos admin) ---
    @Value("${txadmin.base-url}")
    private String txAdminBaseUrl;

    @Value("${txadmin.username}")
    private String txAdminUsername;

    @Value("${txadmin.password}")
    private String txAdminPassword;

    public String getIp()             { return ip; }
    public int    getPort()           { return port; }
    public String getTxAdminBaseUrl() { return txAdminBaseUrl; }
    public String getTxAdminUsername(){ return txAdminUsername; }
    public String getTxAdminPassword(){ return txAdminPassword; }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
