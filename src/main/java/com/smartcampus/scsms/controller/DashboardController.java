package com.smartcampus.scsms.controller;

import com.smartcampus.scsms.dto.ApiResponse;
import com.smartcampus.scsms.dto.DashboardStatsDto;
import com.smartcampus.scsms.service.ServiceRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private final ServiceRequestService serviceRequestService;

    public DashboardController(ServiceRequestService serviceRequestService) {
        this.serviceRequestService = serviceRequestService;
    }

    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats() {
        DashboardStatsDto stats = serviceRequestService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Smart Campus Service Management System",
                "database", "PostgreSQL",
                "timestamp", LocalDateTime.now()
        ));
    }
}
