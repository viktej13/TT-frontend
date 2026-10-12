package com.smartcampus.scsms;

import com.smartcampus.scsms.dto.DashboardStatsDto;
import com.smartcampus.scsms.dto.ServiceRequestCreateDto;
import com.smartcampus.scsms.dto.ServiceRequestResponseDto;
import com.smartcampus.scsms.dto.StatusUpdateDto;
import com.smartcampus.scsms.entity.Priority;
import com.smartcampus.scsms.entity.RequestStatus;
import com.smartcampus.scsms.entity.ServiceCategory;
import com.smartcampus.scsms.exception.ResourceNotFoundException;
import com.smartcampus.scsms.service.ServiceRequestService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ServiceRequestServiceTest {

    @Autowired
    private ServiceRequestService serviceRequestService;

    private ServiceRequestCreateDto sampleDto;

    @BeforeEach
    void setUp() {
        sampleDto = new ServiceRequestCreateDto(
                "Alex Rivera",
                "STU-2024-9021",
                "Computer Science",
                "Wi-Fi",
                "The Wi-Fi in Lab 304 frequently disconnects during network labs.",
                "HIGH",
                "Engineering Block B, Room 304"
        );
    }

    @Test
    void testCreateRequest_Success() {
        ServiceRequestResponseDto created = serviceRequestService.createRequest(sampleDto);

        assertNotNull(created);
        assertNotNull(created.getId());
        assertNotNull(created.getRequestId());
        assertTrue(created.getRequestId().startsWith("REQ-"));
        assertEquals("Alex Rivera", created.getStudentName());
        assertEquals("STU-2024-9021", created.getStudentId());
        assertEquals("Computer Science", created.getDepartment());
        assertEquals(ServiceCategory.WIFI, created.getServiceCategory());
        assertEquals(Priority.HIGH, created.getPriority());
        assertEquals(RequestStatus.PENDING, created.getStatus());
        assertNotNull(created.getCreatedAt());
    }

    @Test
    void testGetRequestByRequestId_Success() {
        ServiceRequestResponseDto created = serviceRequestService.createRequest(sampleDto);
        ServiceRequestResponseDto found = serviceRequestService.getRequestByRequestId(created.getRequestId());

        assertNotNull(found);
        assertEquals(created.getId(), found.getId());
        assertEquals(created.getRequestId(), found.getRequestId());
        assertEquals("Alex Rivera", found.getStudentName());
    }

    @Test
    void testGetRequestByRequestId_NotFound() {
        assertThrows(ResourceNotFoundException.class, () -> {
            serviceRequestService.getRequestByRequestId("REQ-99999999-0000");
        });
    }

    @Test
    void testUpdateRequestStatus_Success() {
        ServiceRequestResponseDto created = serviceRequestService.createRequest(sampleDto);

        StatusUpdateDto inProgressDto = new StatusUpdateDto("IN_PROGRESS", "Technician assigned to investigate AP router.");
        ServiceRequestResponseDto inProgress = serviceRequestService.updateRequestStatus(created.getId(), inProgressDto);

        assertEquals(RequestStatus.IN_PROGRESS, inProgress.getStatus());
        assertEquals("Technician assigned to investigate AP router.", inProgress.getAdminNotes());

        StatusUpdateDto resolvedDto = new StatusUpdateDto("RESOLVED", "Replaced faulty Cisco AP module.");
        ServiceRequestResponseDto resolved = serviceRequestService.updateRequestStatus(created.getId(), resolvedDto);

        assertEquals(RequestStatus.RESOLVED, resolved.getStatus());
        assertEquals("Replaced faulty Cisco AP module.", resolved.getAdminNotes());
    }

    @Test
    void testDeleteRequest_Success() {
        ServiceRequestResponseDto created = serviceRequestService.createRequest(sampleDto);
        Long id = created.getId();

        serviceRequestService.deleteRequest(id);

        assertThrows(ResourceNotFoundException.class, () -> {
            serviceRequestService.getRequestById(id);
        });
    }

    @Test
    void testDashboardStats() {
        serviceRequestService.createRequest(sampleDto);

        ServiceRequestCreateDto dto2 = new ServiceRequestCreateDto(
                "Emma Watson",
                "STU-2024-5541",
                "Electrical Engineering",
                "Electrical",
                "Projector power socket sparks when plugged in.",
                "URGENT",
                "Main Auditorium"
        );
        ServiceRequestResponseDto created2 = serviceRequestService.createRequest(dto2);

        serviceRequestService.updateRequestStatus(created2.getId(), new StatusUpdateDto("RESOLVED", "Socket replaced"));

        DashboardStatsDto stats = serviceRequestService.getDashboardStats();

        assertNotNull(stats);
        assertTrue(stats.getTotalRequests() >= 2);
        assertTrue(stats.getPendingRequests() >= 1);
        assertTrue(stats.getResolvedRequests() >= 1);
        assertNotNull(stats.getRecentRequests());
        assertFalse(stats.getRecentRequests().isEmpty());
    }

    @Test
    void testFilterRequests() {
        serviceRequestService.createRequest(sampleDto);

        List<ServiceRequestResponseDto> wifiRequests = serviceRequestService.getAllRequests(
                null, ServiceCategory.WIFI, null
        );
        assertFalse(wifiRequests.isEmpty());

        List<ServiceRequestResponseDto> searchResults = serviceRequestService.getAllRequests(
                null, null, "Alex"
        );
        assertFalse(searchResults.isEmpty());
    }
}
