package com.smartcampus.scsms.controller;

import com.smartcampus.scsms.dto.ApiResponse;
import com.smartcampus.scsms.dto.DashboardStatsDto;
import com.smartcampus.scsms.dto.ServiceRequestCreateDto;
import com.smartcampus.scsms.dto.ServiceRequestResponseDto;
import com.smartcampus.scsms.dto.StatusUpdateDto;
import com.smartcampus.scsms.entity.RequestStatus;
import com.smartcampus.scsms.entity.ServiceCategory;
import com.smartcampus.scsms.service.ServiceRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*")
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;

    public ServiceRequestController(ServiceRequestService serviceRequestService) {
        this.serviceRequestService = serviceRequestService;
    }

    /**
     * Submit a new service request (Students and Admins)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<ServiceRequestResponseDto>> createRequest(@Valid @RequestBody ServiceRequestCreateDto dto) {
        ServiceRequestResponseDto created = serviceRequestService.createRequest(dto);
        return new ResponseEntity<>(
                ApiResponse.success("Service request submitted successfully with ID: " + created.getRequestId(), created),
                HttpStatus.CREATED
        );
    }

    /**
     * Get all requests (Admins see all; Students see their own)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ServiceRequestResponseDto>>> getAllRequests(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {

        RequestStatus reqStatus = (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL"))
                ? RequestStatus.fromString(status)
                : null;

        ServiceCategory reqCategory = (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("ALL"))
                ? ServiceCategory.fromString(category)
                : null;

        List<ServiceRequestResponseDto> requests = serviceRequestService.getAllRequests(reqStatus, reqCategory, search);
        return ResponseEntity.ok(ApiResponse.success("Requests retrieved successfully", requests));
    }

    /**
     * Get single request by primary database ID (Ownership checked for students)
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<ServiceRequestResponseDto>> getRequestById(@PathVariable Long id) {
        ServiceRequestResponseDto request = serviceRequestService.getRequestById(id);
        return ResponseEntity.ok(ApiResponse.success(request));
    }

    /**
     * Track request by unique formatted Request ID (Ownership checked for students)
     */
    @GetMapping("/track/{requestId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<ServiceRequestResponseDto>> trackRequest(@PathVariable String requestId) {
        ServiceRequestResponseDto request = serviceRequestService.getRequestByRequestId(requestId);
        return ResponseEntity.ok(ApiResponse.success("Request found", request));
    }

    /**
     * Update request status (Pending, In Progress, Resolved) and admin remarks (ADMIN ONLY)
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ServiceRequestResponseDto>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateDto dto) {
        ServiceRequestResponseDto updated = serviceRequestService.updateRequestStatus(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Status updated to " + updated.getStatusDisplayName(), updated));
    }

    /**
     * Delete request by ID (ADMIN ONLY)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRequest(@PathVariable Long id) {
        serviceRequestService.deleteRequest(id);
        return ResponseEntity.ok(ApiResponse.success("Service request deleted successfully", null));
    }

    /**
     * Get dashboard summary analytics and recent requests
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats() {
        DashboardStatsDto stats = serviceRequestService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
