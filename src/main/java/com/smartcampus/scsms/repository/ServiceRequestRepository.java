package com.smartcampus.scsms.repository;

import com.smartcampus.scsms.entity.Priority;
import com.smartcampus.scsms.entity.RequestStatus;
import com.smartcampus.scsms.entity.ServiceCategory;
import com.smartcampus.scsms.entity.ServiceRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {

    Optional<ServiceRequest> findByRequestId(String requestId);

    boolean existsByRequestId(String requestId);

    List<ServiceRequest> findAllByOrderByCreatedAtDesc();

    List<ServiceRequest> findTop5ByOrderByCreatedAtDesc();

    long countByStatus(RequestStatus status);

    long countByServiceCategory(ServiceCategory serviceCategory);

    long countByPriority(Priority priority);

    @Query("SELECT r FROM ServiceRequest r WHERE " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:category IS NULL OR r.serviceCategory = :category) AND " +
           "(:searchTerm IS NULL OR :searchTerm = '' OR " +
           " LOWER(r.requestId) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           " LOWER(r.studentName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           " LOWER(r.studentId) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           " LOWER(r.department) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           " LOWER(r.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           " LOWER(COALESCE(r.location, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY r.createdAt DESC")
    List<ServiceRequest> findFiltered(
            @Param("status") RequestStatus status,
            @Param("category") ServiceCategory category,
            @Param("searchTerm") String searchTerm
    );

    @Query("SELECT r FROM ServiceRequest r WHERE " +
           "(r.user.id = :userId OR r.studentId = :studentId OR LOWER(COALESCE(r.studentEmail, '')) = LOWER(:email)) AND " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:category IS NULL OR r.serviceCategory = :category) AND " +
           "(:searchTerm IS NULL OR :searchTerm = '' OR " +
           " LOWER(r.requestId) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           " LOWER(r.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           " LOWER(COALESCE(r.location, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY r.createdAt DESC")
    List<ServiceRequest> findFilteredForStudent(
            @Param("userId") Long userId,
            @Param("studentId") String studentId,
            @Param("email") String email,
            @Param("status") RequestStatus status,
            @Param("category") ServiceCategory category,
            @Param("searchTerm") String searchTerm
    );

    @Query("SELECT COUNT(r) FROM ServiceRequest r WHERE (r.user.id = :userId OR r.studentId = :studentId OR LOWER(COALESCE(r.studentEmail, '')) = LOWER(:email))")
    long countForStudent(@Param("userId") Long userId, @Param("studentId") String studentId, @Param("email") String email);

    @Query("SELECT COUNT(r) FROM ServiceRequest r WHERE (r.user.id = :userId OR r.studentId = :studentId OR LOWER(COALESCE(r.studentEmail, '')) = LOWER(:email)) AND r.status = :status")
    long countForStudentByStatus(@Param("userId") Long userId, @Param("studentId") String studentId, @Param("email") String email, @Param("status") RequestStatus status);

    @Query("SELECT COUNT(r) FROM ServiceRequest r WHERE (r.user.id = :userId OR r.studentId = :studentId OR LOWER(COALESCE(r.studentEmail, '')) = LOWER(:email)) AND r.serviceCategory = :category")
    long countForStudentByCategory(@Param("userId") Long userId, @Param("studentId") String studentId, @Param("email") String email, @Param("category") ServiceCategory category);

    @Query("SELECT r FROM ServiceRequest r WHERE (r.user.id = :userId OR r.studentId = :studentId OR LOWER(COALESCE(r.studentEmail, '')) = LOWER(:email)) ORDER BY r.createdAt DESC")
    List<ServiceRequest> findRecentForStudent(@Param("userId") Long userId, @Param("studentId") String studentId, @Param("email") String email, Pageable pageable);
}
