package com.fivem.panel.mgmt_service.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fivem.panel.mgmt_service.config.FXServerConfig;
import com.fivem.panel.mgmt_service.exception.PlayerNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Servicio de gestión del servidor FiveM.
 *
 * - getServerStatus() : consulta /info.json y /players.json via HTTP nativo de
 * FXServer.
 * - kickPlayer() : expulsa un jugador via txAdmin API (sesión + CSRF).
 */
@Service
public class FXServerService {

    private static final Logger log = LoggerFactory.getLogger(FXServerService.class);

    private final RestTemplate restTemplate;
    private final FXServerConfig config;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Estado de sesión txAdmin — volatile para seguridad en entornos multi-hilo
    private volatile String sessionCookie = null;
    private volatile String csrfToken = null;

    public FXServerService(RestTemplate restTemplate, FXServerConfig config) {
        this.restTemplate = restTemplate;
        this.config = config;
    }

    // =========================================================================
    // Estado del servidor (HTTP nativo FXServer)
    // =========================================================================

    /**
     * Consulta /info.json y /players.json del FXServer y los combina.
     * FXServer devuelve Content-Type: application/octet-stream, por lo que
     * recogemos como String y parseamos manualmente con Jackson.
     */
    public Map<String, Object> getServerStatus() {
        String base = "http://" + config.getIp() + ":" + config.getPort();
        Map<String, Object> result = new LinkedHashMap<>();
        try {
            String infoRaw = restTemplate.getForObject(base + "/info.json", String.class);
            String playersRaw = restTemplate.getForObject(base + "/players.json", String.class);

            Map<String, Object> info = objectMapper.readValue(infoRaw, new TypeReference<>() {
            });
            List<Object> players = objectMapper.readValue(playersRaw, new TypeReference<>() {
            });

            result.put("status", "online");
            result.put("info", info);
            result.put("players", players);
        } catch (ResourceAccessException e) {
            log.warn("FXServer no accesible en {}:{} — {}", config.getIp(), config.getPort(), e.getMessage());
            result.put("status", "offline");
        } catch (Exception e) {
            log.error("Error al parsear respuesta de FXServer: {}", e.getMessage());
            result.put("status", "error");
            result.put("detail", e.getMessage());
        }
        return result;
    }

    // =========================================================================
    // Kick de jugador (txAdmin API con sesión + CSRF)
    // =========================================================================

    /**
     * Expulsa a un jugador usando la API de txAdmin.
     * Gestiona automáticamente la sesión y el token CSRF. Si la sesión caduca
     * (respuesta 401/403), invalida las credenciales en caché y reintenta una vez.
     */
    public Map<String, Object> kickPlayer(String license, String reason) {
        Map<String, Object> result = new LinkedHashMap<>();
        try {
            ensureAuthenticated();
            postKick(license, reason);
            result.put("success", true);
            result.put("license", license);
        } catch (HttpClientErrorException e) {
            HttpStatusCode status = e.getStatusCode();
            if (status.value() == 401 || status.value() == 403) {
                log.warn("Sesión txAdmin caducada ({}), re-autenticando...", status.value());
                invalidateSession();
                try {
                    ensureAuthenticated();
                    postKick(license, reason);
                    result.put("success", true);
                    result.put("license", license);
                } catch (Exception ex) {
                    String msg = ex.getMessage() != null ? ex.getMessage() : "Error tras re-autenticación";
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
            String msg = e.getMessage() != null ? e.getMessage() : "Error desconocido";
            log.error("Error al expulsar {}:", license, e);
            result.put("success", false);
            result.put("error", msg);
        }
        return result;
    }

    /**
     * Banea a un jugador usando la API de txAdmin.
     *
     * @param license  Hash de licencia sin prefijo (ej: 04a66f575d...)
     * @param reason   Motivo del ban
     * @param duration Duración: "permanent", "1 hour", "1 day", "1 week", "1
     *                 month", etc.
     */
    public Map<String, Object> banPlayer(String license, String reason, String duration) {
        Map<String, Object> result = new LinkedHashMap<>();
        try {
            ensureAuthenticated();
            postBan(license, reason, duration);
            result.put("success", true);
            result.put("license", license);
            result.put("duration", duration);
        } catch (HttpClientErrorException e) {
            HttpStatusCode status = e.getStatusCode();
            if (status.value() == 401 || status.value() == 403) {
                log.warn("Sesión txAdmin caducada ({}), re-autenticando...", status.value());
                invalidateSession();
                try {
                    ensureAuthenticated();
                    postBan(license, reason, duration);
                    result.put("success", true);
                    result.put("license", license);
                    result.put("duration", duration);
                } catch (Exception ex) {
                    String msg = ex.getMessage() != null ? ex.getMessage() : "Error tras re-autenticación";
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

    // =========================================================================
    // Autenticación txAdmin (sesión + CSRF)
    // =========================================================================

    private void ensureAuthenticated() {
        if (sessionCookie == null || csrfToken == null) {
            synchronized (this) {
                if (sessionCookie == null || csrfToken == null) {
                    authenticate();
                }
            }
        }
    }

    private synchronized void invalidateSession() {
        sessionCookie = null;
        csrfToken = null;
    }

    /**
     * Autenticación en dos pasos contra txAdmin v8:
     *
     * Paso 1 — POST /auth/password → obtiene la cookie de sesión
     * (tx:<hash>=<UUID>).
     * Paso 2 — GET / → extrae el token CSRF real desde:
     * window.txConsts.preAuth.csrfToken (embebido en el HTML del SPA)
     */
    private void authenticate() {
        // Paso 1: credenciales → cookie de sesión
        String authUrl = config.getTxAdminBaseUrl() + "/auth/password";

        HttpHeaders authHeaders = new HttpHeaders();
        authHeaders.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<String> authResponse = restTemplate.exchange(
                authUrl, HttpMethod.POST,
                new HttpEntity<>(Map.of(
                        "username", config.getTxAdminUsername(),
                        "password", config.getTxAdminPassword()), authHeaders),
                String.class);

        List<String> setCookieHeaders = authResponse.getHeaders().get(HttpHeaders.SET_COOKIE);
        if (setCookieHeaders == null || setCookieHeaders.isEmpty()) {
            throw new RuntimeException(
                    "txAdmin no devolvió cookie de sesión. Verifica usuario/contraseña y la URL del panel.");
        }

        sessionCookie = setCookieHeaders.stream()
                .map(c -> c.split(";")[0])
                .collect(Collectors.joining("; "));

        log.info("txAdmin: sesión obtenida → {}", sessionCookie);

        // Paso 2: GET / con la sesión → extraer csrfToken de window.txConsts
        HttpHeaders getHeaders = new HttpHeaders();
        getHeaders.set(HttpHeaders.COOKIE, sessionCookie);

        ResponseEntity<String> pageResponse = restTemplate.exchange(
                config.getTxAdminBaseUrl() + "/",
                HttpMethod.GET,
                new HttpEntity<>(getHeaders),
                String.class);

        String html = pageResponse.getBody();
        if (html == null) {
            throw new RuntimeException("txAdmin devolvió body vacío al intentar obtener el CSRF.");
        }

        // Busca: "csrfToken":"OYrwONqLzYCbNfVm_nrsn"
        Matcher m = Pattern.compile("\"csrfToken\":\"([^\"]+)\"").matcher(html);
        if (!m.find()) {
            throw new RuntimeException(
                    "No se encontró csrfToken en window.txConsts. " +
                            "¿La sesión es válida? Body (200 chars): " +
                            html.substring(0, Math.min(html.length(), 200)));
        }

        csrfToken = m.group(1);
        log.info("txAdmin: CSRF token extraído → {}", csrfToken);
    }

    // =========================================================================
    // Llamada a la API de kick
    // =========================================================================

    /**
     * POST /player/kick?license=<hash> (txAdmin v8).
     *
     * El CSRF token se obtiene FRESCO justo antes del POST para evitar tokens
     * obsoletos.
     * Flujo: GET / → extraer csrfToken → POST /player/kick
     */
    private void postKick(String license, String reason) {

        // Obtener CSRF fresco en el mismo instante del kick
        String freshCsrf = fetchFreshCsrf();
        log.info("CSRF fresco para kick: {}", freshCsrf);

        String url = config.getTxAdminBaseUrl() + "/player/kick?license=" + license;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(HttpHeaders.COOKIE, sessionCookie);
        headers.set("x-txadmin-csrftoken", freshCsrf); // nombre exacto que usa txAdmin v8
        headers.set("X-Requested-With", "XMLHttpRequest");

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("reason", reason);

        ResponseEntity<String> resp = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(body, headers),
                String.class);

        String respBody = resp.getBody() != null ? resp.getBody() : "";
        log.info("txAdmin kick — license={} status={} body={}",
                license, resp.getStatusCode(),
                respBody.substring(0, Math.min(respBody.length(), 300)));

        if (respBody.trim().startsWith("<!doctype") || respBody.trim().startsWith("<html")) {
            throw new RuntimeException(
                    "txAdmin devolvió HTML — CSRF o sesión inválidos. CSRF usado: " + freshCsrf);
        }
    }

    /**
     * Hace GET / con la sesión activa y extrae el csrfToken fresco de
     * window.txConsts.
     * También actualiza sessionCookie si txAdmin renueva la cookie de sesión.
     */

    /**
     * POST /player/ban?license=<hash> (txAdmin v8).
     */
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

        ResponseEntity<String> resp = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(body, headers),
                String.class);

        String respBody = resp.getBody() != null ? resp.getBody() : "";
        log.info("txAdmin ban — license={} duration={} status={} body={}",
                license, duration, resp.getStatusCode(),
                respBody.substring(0, Math.min(respBody.length(), 300)));

        if (respBody.trim().startsWith("<!doctype") || respBody.trim().startsWith("<html")) {
            throw new RuntimeException("txAdmin devolvió HTML — CSRF o sesión inválidos.");
        }
    }

    private String fetchFreshCsrf() {
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.COOKIE, sessionCookie);

        ResponseEntity<String> resp = restTemplate.exchange(
                config.getTxAdminBaseUrl() + "/",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                String.class);

        // Actualizar sessionCookie si txAdmin renovó la cookie
        List<String> newCookies = resp.getHeaders().get(HttpHeaders.SET_COOKIE);
        if (newCookies != null && !newCookies.isEmpty()) {
            sessionCookie = newCookies.stream()
                    .map(c -> c.split(";")[0])
                    .collect(Collectors.joining("; "));
            log.info("txAdmin: cookie de sesión renovada → {}", sessionCookie);
        }

        String html = resp.getBody();
        if (html == null)
            throw new RuntimeException("txAdmin devolvió body vacío en GET /");

        Matcher m = Pattern.compile("\"csrfToken\":\"([^\"]+)\"").matcher(html);
        if (!m.find())
            throw new RuntimeException("csrfToken no encontrado en window.txConsts");
        return m.group(1);
    }

    // =========================================================================
    // Búsqueda de licencia por Discord ID (txAdmin players/search)
    // =========================================================================

    /**
     * Busca en txAdmin la licencia FiveM (license:...) asociada a un Discord ID.
     *
     * txAdmin devuelve una lista de jugadores. Iteramos sus identificadores
     * hasta encontrar el que empieza por "license:".
     *
     * @param discordId ID numérico de Discord (sin prefijo "discord:")
     * @return El identificador completo "license:xxxx"
     * @throws PlayerNotFoundException si ningún jugador tiene ese Discord ID
     * @throws RuntimeException        si la respuesta de txAdmin no es parseable
     */
    @SuppressWarnings("unchecked")
    public String findLicenseByDiscordId(String discordId) {
        ensureAuthenticated();

        // txAdmin v8: /player/search con searchType=playerIds
        String url = config.getTxAdminBaseUrl()
                + "/player/search?sortingKey=tsJoined&sortingDesc=true"
                + "&searchValue=discord:" + discordId
                + "&searchType=playerIds";

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.COOKIE, sessionCookie);
        headers.set("x-txadmin-csrftoken", csrfToken);
        headers.set("X-Requested-With", "XMLHttpRequest");

        ResponseEntity<String> resp;
        try {
            resp = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 401 || e.getStatusCode().value() == 403) {
                log.warn("Sesión txAdmin caducada al buscar Discord {}, re-autenticando...", discordId);
                invalidateSession();
                ensureAuthenticated();
                headers.set(HttpHeaders.COOKIE, sessionCookie);
                headers.set("x-txadmin-csrftoken", csrfToken);
                resp = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
            } else {
                throw e;
            }
        }

        String body = resp.getBody();
        if (body == null || body.isBlank()) {
            throw new RuntimeException("txAdmin devolvió respuesta vacía para discordId=" + discordId);
        }

        Map<String, Object> parsed;
        try {
            parsed = objectMapper.readValue(body, new TypeReference<>() {
            });
        } catch (Exception e) {
            throw new RuntimeException("Error al parsear respuesta de txAdmin: " + e.getMessage());
        }

        // txAdmin v8 devuelve: { "players": [ { "license": "04a66f...", "displayName":
        // "...", ... } ] }
        // El campo "license" es el hash sin prefijo — añadimos "license:" al devolver
        List<Map<String, Object>> players = (List<Map<String, Object>>) parsed.get("players");

        if (players == null || players.isEmpty()) {
            throw new PlayerNotFoundException("No se encontró ningún jugador con Discord ID: " + discordId);
        }

        String licenseHash = (String) players.get(0).get("license");
        if (licenseHash == null || licenseHash.isBlank()) {
            throw new PlayerNotFoundException(
                    "El jugador encontrado no tiene licencia FiveM en txAdmin (discordId=" + discordId + ")");
        }

        return "license:" + licenseHash;
    }
}
