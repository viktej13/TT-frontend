package com.smartcampus.scsms;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.scsms.dto.LoginRequest;
import com.smartcampus.scsms.dto.RegisterRequest;
import com.smartcampus.scsms.dto.ServiceRequestCreateDto;
import com.smartcampus.scsms.dto.StatusUpdateDto;
import com.smartcampus.scsms.entity.Role;
import com.smartcampus.scsms.entity.User;
import com.smartcampus.scsms.repository.UserRepository;
import com.smartcampus.scsms.service.ServiceRequestService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ServiceRequestService serviceRequestService;

    @BeforeEach
    void setup() {
        // Ensure clean state for test accounts
    }

    @Test
    void testRegisterStudent_Success_And_BCryptHashed() throws Exception {
        String uniqueEmail = "student_" + System.currentTimeMillis() + "@campus.edu";
        String uniqueId = "STU-" + System.currentTimeMillis();

        RegisterRequest req = new RegisterRequest(
                "Morgan Freeman",
                uniqueId,
                uniqueEmail,
                "Electrical Engineering",
                "SecretPass123",
                "SecretPass123"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.email", is(uniqueEmail)))
                .andExpect(jsonPath("$.data.role", is("ROLE_STUDENT")));

        // Verify password is NOT plaintext in database, but BCrypt hashed
        User saved = userRepository.findByEmail(uniqueEmail).orElse(null);
        assertNotNull(saved);
        assertNotEquals("SecretPass123", saved.getPassword());
        assertTrue(passwordEncoder.matches("SecretPass123", saved.getPassword()));
        assertEquals(Role.ROLE_STUDENT, saved.getRole());
    }

    @Test
    void testRegisterStudent_DuplicateEmail_Rejection() throws Exception {
        String email = "dup_" + System.currentTimeMillis() + "@campus.edu";

        RegisterRequest req1 = new RegisterRequest(
                "First Student",
                "STU-DUP-1",
                email,
                "Physics",
                "Password123",
                "Password123"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isCreated());

        RegisterRequest req2 = new RegisterRequest(
                "Second Student",
                "STU-DUP-2",
                email,
                "Chemistry",
                "Password123",
                "Password123"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("already registered")));
    }

    @Test
    void testLogin_Success_And_SessionManagement() throws Exception {
        String email = "login_test_" + System.currentTimeMillis() + "@campus.edu";
        String pass = "SecurePass987!";

        RegisterRequest reg = new RegisterRequest(
                "Login Tester",
                "STU-LOGIN-" + System.currentTimeMillis(),
                email,
                "Computer Science",
                pass,
                pass
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isCreated());

        // Perform login
        LoginRequest login = new LoginRequest(email, pass);
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.email", is(email)))
                .andReturn();

        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);
        assertNotNull(session, "Session must be created upon successful login");

        // Verify session can access /api/auth/me
        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email", is(email)));

        // Logout
        mockMvc.perform(post("/api/auth/logout")
                        .session(session)
                        .with(csrf()))
                .andExpect(status().isOk());

        // Subsequent /api/auth/me returns 401
        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testLogin_InvalidCredentials_Fails() throws Exception {
        LoginRequest login = new LoginRequest("nonexistent@campus.edu", "WrongPassword!");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    void testUnauthenticated_Access_To_Protected_Endpoint_Returns_401() throws Exception {
        mockMvc.perform(get("/api/requests"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "student@campus.edu", roles = "STUDENT")
    void testStudent_Forbidden_To_Update_Request_Status() throws Exception {
        StatusUpdateDto update = new StatusUpdateDto("RESOLVED", "Student trying to resolve");

        mockMvc.perform(put("/api/requests/1/status")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "student@campus.edu", roles = "STUDENT")
    void testStudent_Forbidden_To_Delete_Request() throws Exception {
        mockMvc.perform(delete("/api/requests/1")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@campus.edu", roles = "ADMIN")
    void testAdmin_Can_Update_Status_And_Delete() throws Exception {
        // Create a test request
        ServiceRequestCreateDto createDto = new ServiceRequestCreateDto(
                "Admin Test Student",
                "STU-ADMIN-TEST",
                "IT",
                "Electrical",
                "Power outage in Server Room 2B",
                "URGENT",
                "Server Room 2B"
        );

        MvcResult createResult = mockMvc.perform(post("/api/requests")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseJson = createResult.getResponse().getContentAsString();
        long requestId = objectMapper.readTree(responseJson).path("data").path("id").asLong();

        // Update status as Admin
        StatusUpdateDto update = new StatusUpdateDto("IN_PROGRESS", "Generator activated, technician dispatched.");
        mockMvc.perform(put("/api/requests/" + requestId + "/status")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("IN_PROGRESS")))
                .andExpect(jsonPath("$.data.adminNotes", is("Generator activated, technician dispatched.")));

        // Delete as Admin
        mockMvc.perform(delete("/api/requests/" + requestId)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    @Test
    void testHealthEndpoint_PubliclyAccessible() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")))
                .andExpect(jsonPath("$.database", is("PostgreSQL")));

        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }
}
