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
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.requestId", startsWith("REQ-")))
                .andExpect(jsonPath("$.data.studentName", is("Jane Doe")))
                .andExpect(jsonPath("$.data.status", is("PENDING")));
    }

    @Test
    void testCreateRequest_ValidationFailure() throws Exception {
        ServiceRequestCreateDto invalidDto = new ServiceRequestCreateDto();
        // All fields blank

        mockMvc.perform(post("/api/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.validationErrors", notNullValue()));
    }

    @Test
    void testGetDashboardStats_Api() throws Exception {
        mockMvc.perform(get("/api/requests/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalRequests", greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.data.categoryCounts", notNullValue()));
    }

    @Test
    void testTrackRequest_NotFound() throws Exception {
        mockMvc.perform(get("/api/requests/track/REQ-NONEXISTENT"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.error", is("Resource Not Found")));
    }
}
