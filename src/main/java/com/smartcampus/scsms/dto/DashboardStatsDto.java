package com.smartcampus.scsms.dto;

import java.util.List;
import java.util.Map;

public class DashboardStatsDto {

    private long totalRequests;
    private long pendingRequests;
    private long inProgressRequests;
    private long resolvedRequests;
    private Map<String, Long> categoryCounts;
    private List<ServiceRequestResponseDto> recentRequests;

    public DashboardStatsDto() {
    }

    public DashboardStatsDto(long totalRequests, long pendingRequests, long inProgressRequests,
                            long resolvedRequests, Map<String, Long> categoryCounts,
                            List<ServiceRequestResponseDto> recentRequests) {
        this.totalRequests = totalRequests;
        this.pendingRequests = pendingRequests;
        this.inProgressRequests = inProgressRequests;
        this.resolvedRequests = resolvedRequests;
        this.categoryCounts = categoryCounts;
        this.recentRequests = recentRequests;
    }

    public long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(long totalRequests) {
        this.totalRequests = totalRequests;
    }

    public long getPendingRequests() {
        return pendingRequests;
    }

    public void setPendingRequests(long pendingRequests) {
        this.pendingRequests = pendingRequests;
    }

    public long getInProgressRequests() {
        return inProgressRequests;
    }

    public void setInProgressRequests(long inProgressRequests) {
        this.inProgressRequests = inProgressRequests;
    }

    public long getResolvedRequests() {
        return resolvedRequests;
    }

    public void setResolvedRequests(long resolvedRequests) {
        this.resolvedRequests = resolvedRequests;
    }

    public Map<String, Long> getCategoryCounts() {
        return categoryCounts;
    }

    public void setCategoryCounts(Map<String, Long> categoryCounts) {
        this.categoryCounts = categoryCounts;
    }

    public List<ServiceRequestResponseDto> getRecentRequests() {
        return recentRequests;
    }

    public void setRecentRequests(List<ServiceRequestResponseDto> recentRequests) {
        this.recentRequests = recentRequests;
    }
}
