package com.smartcampus.scsms.entity;

public enum RequestStatus {
    PENDING("Pending"),
    IN_PROGRESS("In Progress"),
    RESOLVED("Resolved");

    private final String displayName;

    RequestStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static RequestStatus fromString(String text) {
        if (text == null || text.trim().isEmpty()) {
            return PENDING;
        }
        for (RequestStatus status : RequestStatus.values()) {
            if (status.name().equalsIgnoreCase(text.trim()) 
                    || status.displayName.equalsIgnoreCase(text.trim())
                    || status.name().replace("_", " ").equalsIgnoreCase(text.trim())) {
                return status;
            }
        }
        return PENDING;
    }
}
