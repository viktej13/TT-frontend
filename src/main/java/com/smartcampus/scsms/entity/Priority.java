package com.smartcampus.scsms.entity;

public enum Priority {
    LOW("Low"),
    MEDIUM("Medium"),
    HIGH("High"),
    URGENT("Urgent");

    private final String displayName;

    Priority(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static Priority fromString(String text) {
        if (text == null || text.trim().isEmpty()) {
            return MEDIUM;
        }
        for (Priority priority : Priority.values()) {
            if (priority.name().equalsIgnoreCase(text.trim()) 
                    || priority.displayName.equalsIgnoreCase(text.trim())) {
                return priority;
            }
        }
        return MEDIUM;
    }
}
