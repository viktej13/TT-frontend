package com.smartcampus.scsms;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.scsms.dto.ServiceRequestCreateDto;
import com.smartcampus.scsms.dto.StatusUpdateDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.security.test.context.support.WithMockUser;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ServiceRequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "jane@campus.edu", roles = "STUDENT")
    void testCreateRequest_Api() throws Exception {
        ServiceRequestCreateDto dto = new ServiceRequestCreateDto(
                "Jane Doe",
                "STU-2024-8888",
                "Biotechnology",
                "Laboratory Equipment",
                "Autoclave machine displays Error code E-04 during heating cycle.",
                "HIGH",
                "Bio Lab 101"
        );

        mockMvc.perform(post("/api/requests")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.requestId", startsWith("REQ-")))
                .andExpect(jsonPath("$.data.studentName", is("Jane Doe")))
                .andExpect(jsonPath("$.data.status", is("PENDING")));
    }

    @Test
    @WithMockUser(username = "jane@campus.edu", roles = "STUDENT")
    void testCreateRequest_ValidationFailure() throws Exception {
        ServiceRequestCreateDto invalidDto = new ServiceRequestCreateDto();
        // All fields blank

        mockMvc.perform(post("/api/requests")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.validationErrors", notNullValue()));
    }

    @Test
    @WithMockUser(username = "jane@campus.edu", roles = "STUDENT")
    void testGetDashboardStats_Api() throws Exception {
        mockMvc.perform(get("/api/requests/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalRequests", greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.data.categoryCounts", notNullValue()));
    }

    @Test
    @WithMockUser(username = "jane@campus.edu", roles = "STUDENT")
    void testTrackRequest_NotFound() throws Exception {
        mockMvc.perform(get("/api/requests/track/REQ-NONEXISTENT"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.error", is("Resource Not Found")));
    }
}
