package com.smartcampus.scsms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class StatusUpdateDto {

    @NotBlank(message = "Status is required")
    private String status;

    @Size(max = 1000, message = "Admin notes must not exceed 1000 characters")
    private String adminNotes;

    public StatusUpdateDto() {
    }

    public StatusUpdateDto(String status, String adminNotes) {
        this.status = status;
        this.adminNotes = adminNotes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }
}
