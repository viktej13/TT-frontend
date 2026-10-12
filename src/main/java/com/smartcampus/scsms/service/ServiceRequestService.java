package com.smartcampus.scsms.service;

import com.smartcampus.scsms.dto.DashboardStatsDto;
import com.smartcampus.scsms.dto.ServiceRequestCreateDto;
import com.smartcampus.scsms.dto.ServiceRequestResponseDto;
import com.smartcampus.scsms.dto.StatusUpdateDto;
import com.smartcampus.scsms.entity.RequestStatus;
import com.smartcampus.scsms.entity.ServiceCategory;

import java.util.List;

public interface ServiceRequestService {

    ServiceRequestResponseDto createRequest(ServiceRequestCreateDto dto);

    List<ServiceRequestResponseDto> getAllRequests(RequestStatus status, ServiceCategory category, String searchTerm);

    ServiceRequestResponseDto getRequestById(Long id);

    ServiceRequestResponseDto getRequestByRequestId(String requestId);

    ServiceRequestResponseDto updateRequestStatus(Long id, StatusUpdateDto dto);

    void deleteRequest(Long id);

    DashboardStatsDto getDashboardStats();
}
