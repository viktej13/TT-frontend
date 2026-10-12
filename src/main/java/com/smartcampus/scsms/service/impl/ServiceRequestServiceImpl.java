package com.smartcampus.scsms.service.impl;

import com.smartcampus.scsms.dto.DashboardStatsDto;
import com.smartcampus.scsms.dto.ServiceRequestCreateDto;
import com.smartcampus.scsms.dto.ServiceRequestResponseDto;
import com.smartcampus.scsms.dto.StatusUpdateDto;
import com.smartcampus.scsms.entity.Priority;
import com.smartcampus.scsms.entity.RequestStatus;
import com.smartcampus.scsms.entity.Role;
import com.smartcampus.scsms.entity.ServiceCategory;
import com.smartcampus.scsms.entity.ServiceRequest;
import com.smartcampus.scsms.entity.User;
import com.smartcampus.scsms.exception.InvalidRequestException;
import com.smartcampus.scsms.exception.ResourceNotFoundException;
import com.smartcampus.scsms.repository.ServiceRequestRepository;
import com.smartcampus.scsms.repository.UserRepository;
import com.smartcampus.scsms.service.ServiceRequestService;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@Transactional
public class ServiceRequestServiceImpl implements ServiceRequestService {

    private final ServiceRequestRepository repository;
    private final UserRepository userRepository;

    public ServiceRequestServiceImpl(ServiceRequestRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    @Override
    public ServiceRequestResponseDto createRequest(ServiceRequestCreateDto dto) {
        if (dto == null) {
            throw new InvalidRequestException("Request body cannot be null");
        }

        User currentUser = getCurrentUser();
        ServiceCategory category = ServiceCategory.fromString(dto.getServiceCategory());
        Priority priority = Priority.fromString(dto.getPriority());

        ServiceRequest request = new ServiceRequest();
        request.setRequestId(generateUniqueRequestId());

        if (currentUser != null && currentUser.getRole() == Role.ROLE_STUDENT) {
            request.setUser(currentUser);
            request.setStudentEmail(currentUser.getEmail());
            // Use profile data if form is blank, or use form inputs if specified
            request.setStudentName((dto.getStudentName() != null && !dto.getStudentName().trim().isEmpty())
                    ? dto.getStudentName().trim() : currentUser.getFullName());
            request.setStudentId((dto.getStudentId() != null && !dto.getStudentId().trim().isEmpty())
                    ? dto.getStudentId().trim() : currentUser.getStudentId());
            request.setDepartment((dto.getDepartment() != null && !dto.getDepartment().trim().isEmpty())
                    ? dto.getDepartment().trim() : currentUser.getDepartment());
        } else {
            if (currentUser != null) {
                request.setUser(currentUser);
                request.setStudentEmail(currentUser.getEmail());
            }
            request.setStudentName(dto.getStudentName() != null ? dto.getStudentName().trim() : "Student");
            request.setStudentId(dto.getStudentId() != null ? dto.getStudentId().trim() : "N/A");
            request.setDepartment(dto.getDepartment() != null ? dto.getDepartment().trim() : "General");
        }

        request.setServiceCategory(category);
        request.setDescription(dto.getDescription().trim());
        request.setPriority(priority);
        request.setStatus(RequestStatus.PENDING);
        request.setLocation(dto.getLocation() != null ? dto.getLocation().trim() : null);

        ServiceRequest saved = repository.save(request);
        return ServiceRequestResponseDto.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceRequestResponseDto> getAllRequests(RequestStatus status, ServiceCategory category, String searchTerm) {
        User currentUser = getCurrentUser();
        String trimmedSearch = (searchTerm != null && !searchTerm.trim().isEmpty()) ? searchTerm.trim() : null;

        List<ServiceRequest> list;
        if (currentUser != null && currentUser.getRole() == Role.ROLE_STUDENT) {
            // Students can only see their own service requests
            list = repository.findFilteredForStudent(
                    currentUser.getId(),
                    currentUser.getStudentId(),
                    currentUser.getEmail(),
                    status,
                    category,
                    trimmedSearch
            );
        } else {
            // Admins (or system test callers) see all requests
            if (status == null && category == null && trimmedSearch == null) {
                list = repository.findAllByOrderByCreatedAtDesc();
            } else {
                list = repository.findFiltered(status, category, trimmedSearch);
            }
        }

        return list.stream()
                .map(ServiceRequestResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceRequestResponseDto getRequestById(Long id) {
        ServiceRequest request = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found with ID: " + id));

        validateOwnership(request);
        return ServiceRequestResponseDto.fromEntity(request);
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceRequestResponseDto getRequestByRequestId(String requestId) {
        if (requestId == null || requestId.trim().isEmpty()) {
            throw new InvalidRequestException("Request ID must not be empty");
        }

        ServiceRequest request = repository.findByRequestId(requestId.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("No service request found with tracking code: " + requestId.trim().toUpperCase()));

        validateOwnership(request);
        return ServiceRequestResponseDto.fromEntity(request);
    }

    @Override
    public ServiceRequestResponseDto updateRequestStatus(Long id, StatusUpdateDto dto) {
        if (dto == null || dto.getStatus() == null || dto.getStatus().trim().isEmpty()) {
            throw new InvalidRequestException("Status must be provided for update");
        }

        User currentUser = getCurrentUser();
        if (currentUser != null && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new AccessDeniedException("Only administrators can update request status");
        }

        ServiceRequest request = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found with ID: " + id));

        RequestStatus newStatus = RequestStatus.fromString(dto.getStatus());
        request.setStatus(newStatus);

        if (dto.getAdminNotes() != null) {
            request.setAdminNotes(dto.getAdminNotes().trim());
        }

        ServiceRequest updated = repository.save(request);
        return ServiceRequestResponseDto.fromEntity(updated);
    }

    @Override
    public void deleteRequest(Long id) {
        User currentUser = getCurrentUser();
        if (currentUser != null && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new AccessDeniedException("Only administrators can delete service requests");
        }

        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Service request not found with ID: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        User currentUser = getCurrentUser();

        if (currentUser != null && currentUser.getRole() == Role.ROLE_STUDENT) {
            // Student personal dashboard stats
            long total = repository.countForStudent(currentUser.getId(), currentUser.getStudentId(), currentUser.getEmail());
            long pending = repository.countForStudentByStatus(currentUser.getId(), currentUser.getStudentId(), currentUser.getEmail(), RequestStatus.PENDING);
            long inProgress = repository.countForStudentByStatus(currentUser.getId(), currentUser.getStudentId(), currentUser.getEmail(), RequestStatus.IN_PROGRESS);
            long resolved = repository.countForStudentByStatus(currentUser.getId(), currentUser.getStudentId(), currentUser.getEmail(), RequestStatus.RESOLVED);

            Map<String, Long> categoryCounts = new LinkedHashMap<>();
            for (ServiceCategory category : ServiceCategory.values()) {
                categoryCounts.put(category.getDisplayName(), repository.countForStudentByCategory(
                        currentUser.getId(), currentUser.getStudentId(), currentUser.getEmail(), category));
            }

            List<ServiceRequestResponseDto> recentRequests = repository.findRecentForStudent(
                    currentUser.getId(), currentUser.getStudentId(), currentUser.getEmail(), PageRequest.of(0, 5))
                    .stream()
                    .map(ServiceRequestResponseDto::fromEntity)
                    .collect(Collectors.toList());

            return new DashboardStatsDto(total, pending, inProgress, resolved, categoryCounts, recentRequests);
        }

        // Admin (or global) dashboard stats
        long total = repository.count();
        long pending = repository.countByStatus(RequestStatus.PENDING);
        long inProgress = repository.countByStatus(RequestStatus.IN_PROGRESS);
        long resolved = repository.countByStatus(RequestStatus.RESOLVED);

        Map<String, Long> categoryCounts = new LinkedHashMap<>();
        for (ServiceCategory category : ServiceCategory.values()) {
            categoryCounts.put(category.getDisplayName(), repository.countByServiceCategory(category));
        }

        List<ServiceRequestResponseDto> recentRequests = repository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(ServiceRequestResponseDto::fromEntity)
                .collect(Collectors.toList());

        return new DashboardStatsDto(total, pending, inProgress, resolved, categoryCounts, recentRequests);
    }

    private void validateOwnership(ServiceRequest request) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return; // In unauthenticated or permissive internal contexts
        }

        if (currentUser.getRole() == Role.ROLE_ADMIN) {
            return; // Admins can view any request
        }

        // Student can only access requests they own
        boolean isOwner = false;
        if (request.getUser() != null && request.getUser().getId().equals(currentUser.getId())) {
            isOwner = true;
        } else if (currentUser.getStudentId() != null && currentUser.getStudentId().equalsIgnoreCase(request.getStudentId())) {
            isOwner = true;
        } else if (request.getStudentEmail() != null && request.getStudentEmail().equalsIgnoreCase(currentUser.getEmail())) {
            isOwner = true;
        }

        if (!isOwner) {
            throw new AccessDeniedException("Access denied: You do not have permission to view another student's request");
        }
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    private String generateUniqueRequestId() {
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String candidate;
        int attempts = 0;
        do {
            int randomNum = ThreadLocalRandom.current().nextInt(1000, 9999);
            candidate = "REQ-" + datePrefix + "-" + randomNum;
            attempts++;
            if (attempts > 50) {
                candidate = "REQ-" + datePrefix + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
                break;
            }
        } while (repository.existsByRequestId(candidate));

        return candidate;
    }
}
