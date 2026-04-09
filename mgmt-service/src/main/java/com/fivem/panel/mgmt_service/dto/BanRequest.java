package com.fivem.panel.mgmt_service.dto;

/**
 * Body para el endpoint POST /players/ban
 *
 * Ejemplos de duration válidos en txAdmin v8:
 *   "permanent"
 *   "1 hour"  | "6 hours"
 *   "1 day"   | "3 days"
 *   "1 week"  | "2 weeks"
 *   "1 month"
 */
public class BanRequest {

    private String license;  // hash sin prefijo: 04a66f575d2881a187593245ec42ec832399a9f0
    private String reason;
    private String duration; // "permanent", "1 day", "1 week", etc.

    public BanRequest() {}

    public String getLicense()  { return license; }
    public void setLicense(String license) { this.license = license; }

    public String getReason()   { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
}
