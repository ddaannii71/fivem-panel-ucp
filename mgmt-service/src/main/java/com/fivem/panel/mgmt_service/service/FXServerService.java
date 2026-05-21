package com.fivem.panel.mgmt_service.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fivem.panel.mgmt_service.config.FXServerConfig;
import com.fivem.panel.mgmt_service.exception.PlayerNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

// Servicio que habla con el servidor FiveM (FXServer) y con txAdmin
// - getServerStatus(): pregunta al FXServer si esta online y cuantos jugadores hay
// - kickPlayer() y banPlayer(): usan la API de txAdmin (con sesion + CSRF)
// - findLicenseByDiscordId(): busca la licencia de un jugador a partir de su Discord
@Service
public class FXServerService {

    // Logger para imprimir mensajes
    private static final Logger log = LoggerFactory.getLogger(FXServerService.class);

    // RestTemplate para hacer peticiones HTTP
    @Autowired
    private RestTemplate restTemplate;

    // Configuracion con las IPs, puertos y credenciales
    @Autowired
    private FXServerConfig config;

    // Parser de JSON
    private final ObjectMapper objectMapper = new ObjectMapper();

    // La cookie de sesion de txAdmin (se guarda despues de hacer login)
    // volatile para que sea segura entre hilos
    private volatile String sessionCookie = null;

    // El token CSRF de txAdmin
    private volatile String csrfToken = null;

    // Pide al FXServer su estado: info y lista de jugadores online
    // Junta /info.json y /players.json en un solo Map
    public Map<String, Object> getServerStatus() {
        String base = "http://" + config.getIp() + ":" + config.getPort();
        Map<String, Object> result = new LinkedHashMap<>();

        try {
            // Pido los dos endpoints del FXServer
            String infoRaw = restTemplate.getForObject(base + "/info.json", String.class);
            String playersRaw = restTemplate.getForObject(base + "/players.json", String.class);

            // Parseo los JSON manualmente porque FXServer devuelve el content-type raro
            Map<String, Object> info = objectMapper.readValue(infoRaw, new TypeReference<Map<String, Object>>() {});
            List<Object> players = objectMapper.readValue(playersRaw, new TypeReference<List<Object>>() {});

            // Lo meto todo en el resultado
            result.put("status", "online");
            result.put("info", info);
            result.put("players", players);
        } catch (ResourceAccessException e) {
            // Si no se puede conectar, esta offline
            log.warn("FXServer no accesible en {}:{} - {}", config.getIp(), config.getPort(), e.getMessage());
            result.put("status", "offline");
        } catch (Exception e) {
            // Si pasa otra cosa, devuelvo error
            log.error("Error al parsear respuesta de FXServer: {}", e.getMessage());
            result.put("status", "error");
            result.put("detail", e.getMessage());
        }

        return result;
    }

    // Expulsa a un jugador usando la API de txAdmin
    // Si la sesion ha caducado, vuelve a hacer login y reintenta
    public Map<String, Object> kickPlayer(String license, String reason) {
        Map<String, Object> result = new LinkedHashMap<>();

        try {
            // Me aseguro de tener sesion abierta
            ensureAuthenticated();
            // Hago el POST /player/kick
            postKick(license, reason);
            result.put("success", true);
            result.put("license", license);
        } catch (HttpClientErrorException e) {
            // Si me da 401 o 403 es que la sesion caduco
            int statusCode = e.getStatusCode().value();
            if (statusCode == 401 || statusCode == 403) {
                log.warn("Sesion txAdmin caducada ({}), re-autenticando...", statusCode);
                invalidateSession();

                // Reintento una vez con sesion nueva
                try {
                    ensureAuthenticated();
                    postKick(license, reason);
                    result.put("success", true);
                    result.put("license", license);
                } catch (Exception ex) {
                    String msg = ex.getMessage() != null ? ex.getMessage() : "Error tras re-autenticacion";
                    log.error("Error al expulsar {} tras re-auth:", license, ex);
                    result.put("success", false);
                    result.put("error", msg);
                }
            } else {
                String msg = e.getMessage() != null ? e.getMessage() : "Error HTTP de txAdmin";
                log.error("Error HTTP al expulsar {}: {}", license, msg);
                result.put("success", false);
                result.put("error", msg);
            }
        } catch (Exception e) {
            // Cualquier otro error
            String msg = e.getMessage() != null ? e.getMessage() : "Error desconocido";
            log.error("Error al expulsar {}:", license, e);
            result.put("success", false);
            result.put("error", msg);
        }

        return result;
    }

    // Banea a un jugador (misma logica que el kick pero con duracion)
    public Map<String, Object> banPlayer(String license, String reason, String duration) {
        Map<String, Object> result = new LinkedHashMap<>();

        try {
            ensureAuthenticated();
            postBan(license, reason, duration);
            result.put("success", true);
            result.put("license", license);
            result.put("duration", duration);
        } catch (HttpClientErrorException e) {
            int statusCode = e.getStatusCode().value();
            if (statusCode == 401 || statusCode == 403) {
                log.warn("Sesion txAdmin caducada ({}), re-autenticando...", statusCode);
                invalidateSession();

                try {
                    ensureAuthenticated();
                    postBan(license, reason, duration);
                    result.put("success", true);
                    result.put("license", license);
                    result.put("duration", duration);
                } catch (Exception ex) {
                    String msg = ex.getMessage() != null ? ex.getMessage() : "Error tras re-autenticacion";
                    log.error("Error al banear {} tras re-auth:", license, ex);
                    result.put("success", false);
                    result.put("error", msg);
                }
            } else {
                String msg = e.getMessage() != null ? e.getMessage() : "Error HTTP de txAdmin";
                log.error("Error HTTP al banear {}: {}", license, msg);
                result.put("success", false);
                result.put("error", msg);
            }
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : "Error desconocido";
            log.error("Error al banear {}:", license, e);
            result.put("success", false);
            result.put("error", msg);
        }

        return result;
    }

    // Se asegura de que estamos logueados en txAdmin
    // Si no hay sesion, llama a authenticate() (sincronizado para evitar varias autenticaciones a la vez)
    private void ensureAuthenticated() {
        if (sessionCookie == null || csrfToken == null) {
            synchronized (this) {
                if (sessionCookie == null || csrfToken == null) {
                    authenticate();
                }
            }
        }
    }

    // Borra la sesion guardada para forzar un nuevo login
    private synchronized void invalidateSession() {
        sessionCookie = null;
        csrfToken = null;
    }

    // Hace login en txAdmin en dos pasos
    // 1) POST /auth/password para conseguir la cookie de sesion
    // 2) GET / para sacar el token CSRF que viene incrustado en el HTML
    private void authenticate() {
        // PASO 1: login con usuario y contrasena
        String authUrl = config.getTxAdminBaseUrl() + "/auth/password";

        HttpHeaders authHeaders = new HttpHeaders();
        authHeaders.setContentType(MediaType.APPLICATION_JSON);

        // Preparo el body con las credenciales
        Map<String, Object> credenciales = new HashMap<>();
        credenciales.put("username", config.getTxAdminUsername());
        credenciales.put("password", config.getTxAdminPassword());

        ResponseEntity<String> authResponse = restTemplate.exchange(
                authUrl,
                HttpMethod.POST,
                new HttpEntity<>(credenciales, authHeaders),
                String.class);

        // Saco las cookies de la respuesta
        List<String> setCookieHeaders = authResponse.getHeaders().get(HttpHeaders.SET_COOKIE);
        if (setCookieHeaders == null || setCookieHeaders.isEmpty()) {
            throw new RuntimeException(
                    "txAdmin no devolvio cookie de sesion. Comprueba usuario/contrasena y la URL del panel.");
        }

        // Junto todas las cookies en una sola string
        StringBuilder cookies = new StringBuilder();
        for (int i = 0; i < setCookieHeaders.size(); i++) {
            String parteCookie = setCookieHeaders.get(i).split(";")[0];
            if (i > 0) {
                cookies.append("; ");
            }
            cookies.append(parteCookie);
        }
        sessionCookie = cookies.toString();

        log.info("txAdmin: sesion obtenida -> {}", sessionCookie);

        // PASO 2: GET / para sacar el csrfToken del HTML
        HttpHeaders getHeaders = new HttpHeaders();
        getHeaders.set(HttpHeaders.COOKIE, sessionCookie);

        ResponseEntity<String> pageResponse = restTemplate.exchange(
                config.getTxAdminBaseUrl() + "/",
                HttpMethod.GET,
                new HttpEntity<>(getHeaders),
                String.class);

        String html = pageResponse.getBody();
        if (html == null) {
            throw new RuntimeException("txAdmin devolvio body vacio al intentar obtener el CSRF.");
        }

        // Busco el csrfToken con una expresion regular
        // El HTML trae algo como: "csrfToken":"OYrwONqLzYCbNfVm_nrsn"
        Matcher m = Pattern.compile("\"csrfToken\":\"([^\"]+)\"").matcher(html);
        if (!m.find()) {
            int max = Math.min(html.length(), 200);
            throw new RuntimeException(
                    "No se encontro csrfToken en window.txConsts. " +
                            "Sesion valida? Body (200 chars): " + html.substring(0, max));
        }

        csrfToken = m.group(1);
        log.info("txAdmin: CSRF token extraido -> {}", csrfToken);
    }

    // Hace el POST a /player/kick de txAdmin
    // Antes pide un CSRF fresco porque el viejo a veces no vale
    private void postKick(String license, String reason) {
        // Pido un CSRF nuevo justo antes
        String freshCsrf = fetchFreshCsrf();
        log.info("CSRF fresco para kick: {}", freshCsrf);

        // Monto la URL
        String url = config.getTxAdminBaseUrl() + "/player/kick?license=" + license;

        // Preparo las cabeceras
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(HttpHeaders.COOKIE, sessionCookie);
        // Nombre exacto que espera txAdmin v8
        headers.set("x-txadmin-csrftoken", freshCsrf);
        headers.set("X-Requested-With", "XMLHttpRequest");

        // Body con el motivo
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("reason", reason);

        // Hago el POST
        ResponseEntity<String> resp = restTemplate.exchange(
                url, HttpMethod.POST,
                new HttpEntity<>(body, headers),
                String.class);

        // Imprimo lo que devolvio para depurar
        String respBody = resp.getBody() != null ? resp.getBody() : "";
        int maxLog = Math.min(respBody.length(), 300);
        log.info("txAdmin kick - license={} status={} body={}",
                license, resp.getStatusCode(), respBody.substring(0, maxLog));

        // Si me devuelve HTML es que algo salio mal con el CSRF o la sesion
        String trimmed = respBody.trim();
        if (trimmed.startsWith("<!doctype") || trimmed.startsWith("<html")) {
            throw new RuntimeException(
                    "txAdmin devolvio HTML - CSRF o sesion invalidos. CSRF usado: " + freshCsrf);
        }
    }

    // Hace el POST a /player/ban de txAdmin (parecido al kick pero con duracion)
    private void postBan(String license, String reason, String duration) {
        String url = config.getTxAdminBaseUrl() + "/player/ban?license=" + license;

        String freshCsrf = fetchFreshCsrf();
        log.info("CSRF fresco para ban: {}", freshCsrf);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(HttpHeaders.COOKIE, sessionCookie);
        headers.set("x-txadmin-csrftoken", freshCsrf);
        headers.set("X-Requested-With", "XMLHttpRequest");

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("reason", reason);
        body.put("duration", duration);

        ResponseEntity<String> resp = restTemplate.exchange(
                url, HttpMethod.POST,
                new HttpEntity<>(body, headers),
                String.class);

        String respBody = resp.getBody() != null ? resp.getBody() : "";
        int maxLog = Math.min(respBody.length(), 300);
        log.info("txAdmin ban - license={} duration={} status={} body={}",
                license, duration, resp.getStatusCode(), respBody.substring(0, maxLog));

        String trimmed = respBody.trim();
        if (trimmed.startsWith("<!doctype") || trimmed.startsWith("<html")) {
            throw new RuntimeException("txAdmin devolvio HTML - CSRF o sesion invalidos.");
        }
    }

    // Hace GET / con la sesion activa y saca un csrfToken nuevo del HTML
    // Si txAdmin renueva la cookie, la actualizo tambien
    private String fetchFreshCsrf() {
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.COOKIE, sessionCookie);

        ResponseEntity<String> resp = restTemplate.exchange(
                config.getTxAdminBaseUrl() + "/",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                String.class);

        // Si me llegan cookies nuevas, las guardo
        List<String> newCookies = resp.getHeaders().get(HttpHeaders.SET_COOKIE);
        if (newCookies != null && !newCookies.isEmpty()) {
            StringBuilder cookies = new StringBuilder();
            for (int i = 0; i < newCookies.size(); i++) {
                String parteCookie = newCookies.get(i).split(";")[0];
                if (i > 0) {
                    cookies.append("; ");
                }
                cookies.append(parteCookie);
            }
            sessionCookie = cookies.toString();
            log.info("txAdmin: cookie de sesion renovada -> {}", sessionCookie);
        }

        String html = resp.getBody();
        if (html == null) {
            throw new RuntimeException("txAdmin devolvio body vacio en GET /");
        }

        // Saco el csrfToken con regex
        Matcher m = Pattern.compile("\"csrfToken\":\"([^\"]+)\"").matcher(html);
        if (!m.find()) {
            throw new RuntimeException("csrfToken no encontrado en window.txConsts");
        }

        return m.group(1);
    }

    // Busca la licencia FiveM de un jugador a partir de su ID de Discord
    // Usa el endpoint /player/search de txAdmin
    @SuppressWarnings("unchecked")
    public String findLicenseByDiscordId(String discordId) {
        ensureAuthenticated();

        // Monto la URL de busqueda en txAdmin v8
        String url = config.getTxAdminBaseUrl()
                + "/player/search?sortingKey=tsJoined&sortingDesc=true"
                + "&searchValue=discord:" + discordId
                + "&searchType=playerIds";

        // Cabeceras con sesion y CSRF
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.COOKIE, sessionCookie);
        headers.set("x-txadmin-csrftoken", csrfToken);
        headers.set("X-Requested-With", "XMLHttpRequest");

        ResponseEntity<String> resp;
        try {
            // Hago la peticion
            resp = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
        } catch (HttpClientErrorException e) {
            // Si me da 401/403, reintento con sesion nueva
            int statusCode = e.getStatusCode().value();
            if (statusCode == 401 || statusCode == 403) {
                log.warn("Sesion txAdmin caducada al buscar Discord {}, re-autenticando...", discordId);
                invalidateSession();
                ensureAuthenticated();
                headers.set(HttpHeaders.COOKIE, sessionCookie);
                headers.set("x-txadmin-csrftoken", csrfToken);
                resp = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
            } else {
                throw e;
            }
        }

        // Compruebo que la respuesta no sea nula
        String body = resp.getBody();
        if (body == null || body.isBlank()) {
            throw new RuntimeException("txAdmin devolvio respuesta vacia para discordId=" + discordId);
        }

        // Parseo el JSON
        Map<String, Object> parsed;
        try {
            parsed = objectMapper.readValue(body, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Error al parsear respuesta de txAdmin: " + e.getMessage());
        }

        // txAdmin devuelve { "players": [ { "license": "abc..." } ] }
        List<Map<String, Object>> players = (List<Map<String, Object>>) parsed.get("players");

        if (players == null || players.isEmpty()) {
            throw new PlayerNotFoundException("No se encontro ningun jugador con Discord ID: " + discordId);
        }

        // Cojo el primero
        String licenseHash = (String) players.get(0).get("license");
        if (licenseHash == null || licenseHash.isBlank()) {
            throw new PlayerNotFoundException(
                    "El jugador encontrado no tiene licencia FiveM en txAdmin (discordId=" + discordId + ")");
        }

        // Le anado el prefijo "license:" y lo devuelvo
        return "license:" + licenseHash;
    }
}
