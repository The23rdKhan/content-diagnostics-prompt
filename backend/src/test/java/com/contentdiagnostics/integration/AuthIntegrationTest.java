package com.contentdiagnostics.integration;

import com.contentdiagnostics.auth.dto.AuthResponse;
import com.contentdiagnostics.auth.dto.LoginRequest;
import com.contentdiagnostics.auth.dto.SignUpRequest;
import com.contentdiagnostics.auth.entity.UserRole;
import com.contentdiagnostics.auth.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for authentication flows.
 *
 * Tests:
 * - User signup (creator and reviewer)
 * - Login with valid credentials
 * - Login with invalid credentials
 * - Token refresh
 * - Admin role cannot be self-registered
 * - Protected endpoint access
 */
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AuthIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    private static String creatorAccessToken;
    private static String creatorRefreshToken;

    @BeforeEach
    void setUp() {
        // Clean up test users before each test class run
    }

    @Test
    @Order(1)
    @DisplayName("Should successfully sign up a new creator")
    void shouldSignUpCreator() throws Exception {
        SignUpRequest request = new SignUpRequest();
        request.setEmail("creator-test@example.com");
        request.setPassword("Password123!");
        request.setRole(UserRole.CREATOR);
        request.setName("Test Creator");
        request.setCompany("Test Company");

        MvcResult result = mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.user.email").value("creator-test@example.com"))
                .andExpect(jsonPath("$.user.role").value("CREATOR"))
                .andReturn();

        AuthResponse response = objectMapper.readValue(
                result.getResponse().getContentAsString(), AuthResponse.class);

        creatorAccessToken = response.getAccessToken();
        creatorRefreshToken = response.getRefreshToken();

        assertThat(creatorAccessToken).isNotBlank();
        assertThat(creatorRefreshToken).isNotBlank();
    }

    @Test
    @Order(2)
    @DisplayName("Should successfully sign up a new reviewer")
    void shouldSignUpReviewer() throws Exception {
        SignUpRequest request = new SignUpRequest();
        request.setEmail("reviewer-test@example.com");
        request.setPassword("Password123!");
        request.setRole(UserRole.REVIEWER);
        request.setName("Test Reviewer");
        request.setProficiency("native");

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.role").value("REVIEWER"));
    }

    @Test
    @Order(3)
    @DisplayName("Should reject admin self-registration")
    void shouldRejectAdminSelfRegistration() throws Exception {
        SignUpRequest request = new SignUpRequest();
        request.setEmail("admin-test@example.com");
        request.setPassword("Password123!");
        request.setRole(UserRole.ADMIN);
        request.setName("Wannabe Admin");

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Admin accounts cannot be self-registered"));
    }

    @Test
    @Order(4)
    @DisplayName("Should reject duplicate email registration")
    void shouldRejectDuplicateEmail() throws Exception {
        SignUpRequest request = new SignUpRequest();
        request.setEmail("creator-test@example.com"); // Same as first test
        request.setPassword("Password123!");
        request.setRole(UserRole.CREATOR);
        request.setName("Another Creator");

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    @Order(5)
    @DisplayName("Should login with valid credentials")
    void shouldLoginWithValidCredentials() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("creator-test@example.com");
        request.setPassword("Password123!");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.user.email").value("creator-test@example.com"));
    }

    @Test
    @Order(6)
    @DisplayName("Should reject login with invalid password")
    void shouldRejectInvalidPassword() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("creator-test@example.com");
        request.setPassword("WrongPassword!");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(7)
    @DisplayName("Should reject login with non-existent email")
    void shouldRejectNonExistentEmail() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("nonexistent@example.com");
        request.setPassword("Password123!");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(8)
    @DisplayName("Should access protected endpoint with valid token")
    void shouldAccessProtectedEndpoint() throws Exception {
        // Get fresh token
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("creator-test@example.com");
        loginRequest.setPassword("Password123!");

        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse authResponse = objectMapper.readValue(
                loginResult.getResponse().getContentAsString(), AuthResponse.class);

        // Access profile endpoint
        mockMvc.perform(get("/auth/me")
                        .header("Authorization", "Bearer " + authResponse.getAccessToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("creator-test@example.com"))
                .andExpect(jsonPath("$.role").value("CREATOR"));
    }

    @Test
    @Order(9)
    @DisplayName("Should reject protected endpoint without token")
    void shouldRejectProtectedEndpointWithoutToken() throws Exception {
        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(10)
    @DisplayName("Should reject protected endpoint with invalid token")
    void shouldRejectProtectedEndpointWithInvalidToken() throws Exception {
        mockMvc.perform(get("/auth/me")
                        .header("Authorization", "Bearer invalid.token.here"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(11)
    @DisplayName("Should refresh access token")
    void shouldRefreshAccessToken() throws Exception {
        // First login to get tokens
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("creator-test@example.com");
        loginRequest.setPassword("Password123!");

        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse authResponse = objectMapper.readValue(
                loginResult.getResponse().getContentAsString(), AuthResponse.class);

        // Refresh token
        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\": \"" + authResponse.getRefreshToken() + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists());
    }
}
