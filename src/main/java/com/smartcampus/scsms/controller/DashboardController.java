package com.smartcampus.scsms.controller;

import com.smartcampus.scsms.dto.ApiResponse;
import com.smartcampus.scsms.dto.DashboardStatsDto;
import com.smartcampus.scsms.service.ServiceRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final ServiceRequestService serviceRequestService;

    public DashboardController(ServiceRequestService serviceRequestService) {
        this.serviceRequestService = serviceRequestService;
    }

    @GetMapping("/stats")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats() {
        DashboardStatsDto stats = serviceRequestService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
