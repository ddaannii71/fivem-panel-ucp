package com.fivem.panel.mgmt_service.dto;

public class KickRequest {

    private String license; // hash sin prefijo: 04a66f575d2881a187593245ec42ec832399a9f0
    private String reason;

    public KickRequest() {}

    public String getLicense() { return license; }
    public void setLicense(String license) { this.license = license; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
