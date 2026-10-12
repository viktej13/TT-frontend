package com.smartcampus.scsms.entity;

public enum ServiceCategory {
    ELECTRICAL("Electrical"),
    PLUMBING("Plumbing"),
    WIFI("Wi-Fi"),
    CLASSROOM_MAINTENANCE("Classroom Maintenance"),
    LABORATORY_EQUIPMENT("Laboratory Equipment"),
    OTHER("Other");

    private final String displayName;

    ServiceCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static ServiceCategory fromString(String text) {
        if (text == null || text.trim().isEmpty()) {
            return OTHER;
        }
        for (ServiceCategory category : ServiceCategory.values()) {
            if (category.name().equalsIgnoreCase(text.trim()) 
                    || category.displayName.equalsIgnoreCase(text.trim())
                    || category.name().replace("_", " ").equalsIgnoreCase(text.trim())
                    || category.name().replace("_", "").equalsIgnoreCase(text.trim().replace("-", "").replace(" ", ""))) {
                return category;
            }
        }
        return OTHER;
    }
}
