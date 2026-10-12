package com.smartcampus.scsms.dto;

import com.smartcampus.scsms.entity.Priority;
import com.smartcampus.scsms.entity.RequestStatus;
import com.smartcampus.scsms.entity.ServiceCategory;
import com.smartcampus.scsms.entity.ServiceRequest;

import java.time.LocalDateTime;

public class ServiceRequestResponseDto {

    private Long id;
    private String requestId;
    private String studentName;
    private String studentId;
    private String department;
    private ServiceCategory serviceCategory;
    private String categoryDisplayName;
    private String description;
    private Priority priority;
    private String priorityDisplayName;
    private RequestStatus status;
    private String statusDisplayName;
    private String location;
    private String adminNotes;
    private String studentEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ServiceRequestResponseDto() {
    }

    public static ServiceRequestResponseDto fromEntity(ServiceRequest entity) {
        if (entity == null) {
            return null;
        }
        ServiceRequestResponseDto dto = new ServiceRequestResponseDto();
        dto.setId(entity.getId());
        dto.setRequestId(entity.getRequestId());
        dto.setStudentName(entity.getStudentName());
        dto.setStudentId(entity.getStudentId());
        dto.setDepartment(entity.getDepartment());
        dto.setServiceCategory(entity.getServiceCategory());
        dto.setCategoryDisplayName(entity.getServiceCategory() != null ? entity.getServiceCategory().getDisplayName() : null);
        dto.setDescription(entity.getDescription());
        dto.setPriority(entity.getPriority());
        dto.setPriorityDisplayName(entity.getPriority() != null ? entity.getPriority().getDisplayName() : null);
        dto.setStatus(entity.getStatus());
        dto.setStatusDisplayName(entity.getStatus() != null ? entity.getStatus().getDisplayName() : null);
        dto.setLocation(entity.getLocation());
        dto.setAdminNotes(entity.getAdminNotes());
        dto.setStudentEmail(entity.getStudentEmail());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public ServiceCategory getServiceCategory() {
        return serviceCategory;
    }

    public void setServiceCategory(ServiceCategory serviceCategory) {
        this.serviceCategory = serviceCategory;
    }

    public String getCategoryDisplayName() {
        return categoryDisplayName;
    }

    public void setCategoryDisplayName(String categoryDisplayName) {
        this.categoryDisplayName = categoryDisplayName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public String getPriorityDisplayName() {
        return priorityDisplayName;
    }

    public void setPriorityDisplayName(String priorityDisplayName) {
        this.priorityDisplayName = priorityDisplayName;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }

    public String getStatusDisplayName() {
        return statusDisplayName;
    }

    public void setStatusDisplayName(String statusDisplayName) {
        this.statusDisplayName = statusDisplayName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }
}
