package com.contentdiagnostics.auth.service;

import com.contentdiagnostics.auth.dto.AuthResponse;
import com.contentdiagnostics.auth.dto.LoginRequest;
import com.contentdiagnostics.auth.dto.SignUpRequest;
import com.contentdiagnostics.auth.entity.RefreshToken;
import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.auth.entity.UserRole;
import com.contentdiagnostics.auth.repository.RefreshTokenRepository;
import com.contentdiagnostics.auth.repository.UserRepository;
import com.contentdiagnostics.common.exception.BadRequestException;
import com.contentdiagnostics.common.exception.ConflictException;
import com.contentdiagnostics.common.exception.UnauthorizedException;
import com.contentdiagnostics.creators.entity.CreatorProfile;
import com.contentdiagnostics.creators.repository.CreatorProfileRepository;
import com.contentdiagnostics.reviewers.entity.ReviewerProfile;
import com.contentdiagnostics.reviewers.repository.ReviewerProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private CreatorProfileRepository creatorProfileRepository;

    @Mock
    private ReviewerProfileRepository reviewerProfileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private SignUpRequest signUpRequest;
    private LoginRequest loginRequest;
    private User testUser;
    private String userAgent = "Mozilla/5.0";
    private String ipAddress = "127.0.0.1";

    @BeforeEach
    void setUp() {
        // Set the initial quality score field
        ReflectionTestUtils.setField(authService, "initialQualityScore", 100);

        signUpRequest = new SignUpRequest();
        signUpRequest.setEmail("test@example.com");
        signUpRequest.setPassword("password123");
        signUpRequest.setRole(UserRole.CREATOR);
        signUpRequest.setFirstName("Test");
        signUpRequest.setLastName("User");
        signUpRequest.setTosAccepted(true);

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("hashedPassword");
        testUser.setRole(UserRole.CREATOR);
        testUser.setEnabled(true);
    }

    @Nested
    @DisplayName("signUp")
    class SignUp {

        @Test
        @DisplayName("should create new user and return tokens")
        void shouldCreateUserAndReturnTokens() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
            when(userRepository.save(any(User.class))).thenAnswer(i -> {
                User u = i.getArgument(0);
                u.setId(1L);
                return u;
            });
            when(jwtService.generateAccessToken(any(User.class))).thenReturn("access_token");
            when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refresh_token");
            when(jwtService.getRefreshTokenExpiration()).thenReturn(Instant.now().plusSeconds(86400));
            when(jwtService.getAccessTokenExpirationSeconds()).thenReturn(3600L);
            when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArgument(0));
            when(creatorProfileRepository.save(any(CreatorProfile.class))).thenAnswer(i -> i.getArgument(0));

            AuthResponse response = authService.signUp(signUpRequest, userAgent, ipAddress);

            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isEqualTo("access_token");
            assertThat(response.getRefreshToken()).isEqualTo("refresh_token");
            assertThat(response.getUser().getRole()).isEqualTo(UserRole.CREATOR);

            verify(userRepository).save(any(User.class));
            verify(creatorProfileRepository).save(any(CreatorProfile.class));
        }

        @Test
        @DisplayName("should create reviewer profile for reviewer role")
        void shouldCreateReviewerProfile() {
            signUpRequest.setRole(UserRole.REVIEWER);

            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
            when(userRepository.save(any(User.class))).thenAnswer(i -> {
                User u = i.getArgument(0);
                u.setId(1L);
                return u;
            });
            when(jwtService.generateAccessToken(any(User.class))).thenReturn("access_token");
            when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refresh_token");
            when(jwtService.getRefreshTokenExpiration()).thenReturn(Instant.now().plusSeconds(86400));
            when(jwtService.getAccessTokenExpirationSeconds()).thenReturn(3600L);
            when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArgument(0));
            when(reviewerProfileRepository.save(any(ReviewerProfile.class))).thenAnswer(i -> i.getArgument(0));

            AuthResponse response = authService.signUp(signUpRequest, userAgent, ipAddress);

            assertThat(response.getUser().getRole()).isEqualTo(UserRole.REVIEWER);
            verify(reviewerProfileRepository).save(any(ReviewerProfile.class));
            verify(creatorProfileRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw when email already exists")
        void shouldThrowWhenEmailExists() {
            when(userRepository.existsByEmail(signUpRequest.getEmail())).thenReturn(true);

            assertThatThrownBy(() -> authService.signUp(signUpRequest, userAgent, ipAddress))
                    .isInstanceOf(ConflictException.class)
                    .hasMessageContaining("Email");
        }

        @Test
        @DisplayName("should throw when trying to register as admin")
        void shouldThrowWhenRegisteringAsAdmin() {
            signUpRequest.setRole(UserRole.ADMIN);
            when(userRepository.existsByEmail(anyString())).thenReturn(false);

            assertThatThrownBy(() -> authService.signUp(signUpRequest, userAgent, ipAddress))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Admin");
        }

        @Test
        @DisplayName("should hash password before saving")
        void shouldHashPassword() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode("password123")).thenReturn("hashedPassword123");
            when(userRepository.save(any(User.class))).thenAnswer(i -> {
                User u = i.getArgument(0);
                u.setId(1L);
                return u;
            });
            when(jwtService.generateAccessToken(any(User.class))).thenReturn("access_token");
            when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refresh_token");
            when(jwtService.getRefreshTokenExpiration()).thenReturn(Instant.now().plusSeconds(86400));
            when(jwtService.getAccessTokenExpirationSeconds()).thenReturn(3600L);
            when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArgument(0));
            when(creatorProfileRepository.save(any(CreatorProfile.class))).thenAnswer(i -> i.getArgument(0));

            authService.signUp(signUpRequest, userAgent, ipAddress);

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());

            assertThat(userCaptor.getValue().getPasswordHash()).isEqualTo("hashedPassword123");
        }

        @Test
        @DisplayName("should initialize reviewer with quality score and locked queue")
        void shouldInitializeReviewerWithQualityScore() {
            signUpRequest.setRole(UserRole.REVIEWER);

            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
            when(userRepository.save(any(User.class))).thenAnswer(i -> {
                User u = i.getArgument(0);
                u.setId(1L);
                return u;
            });
            when(jwtService.generateAccessToken(any(User.class))).thenReturn("access_token");
            when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refresh_token");
            when(jwtService.getRefreshTokenExpiration()).thenReturn(Instant.now().plusSeconds(86400));
            when(jwtService.getAccessTokenExpirationSeconds()).thenReturn(3600L);
            when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArgument(0));
            when(reviewerProfileRepository.save(any(ReviewerProfile.class))).thenAnswer(i -> i.getArgument(0));

            authService.signUp(signUpRequest, userAgent, ipAddress);

            ArgumentCaptor<ReviewerProfile> profileCaptor = ArgumentCaptor.forClass(ReviewerProfile.class);
            verify(reviewerProfileRepository).save(profileCaptor.capture());

            assertThat(profileCaptor.getValue().getQualityScore()).isEqualTo(100);
            assertThat(profileCaptor.getValue().isQueueLocked()).isTrue();
        }
    }

    @Nested
    @DisplayName("login")
    class Login {

        @Test
        @DisplayName("should return tokens for valid credentials")
        void shouldReturnTokensForValidCredentials() {
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(new UsernamePasswordAuthenticationToken(testUser, null));
            when(jwtService.generateAccessToken(testUser)).thenReturn("access_token");
            when(jwtService.generateRefreshToken(testUser)).thenReturn("refresh_token");
            when(jwtService.getRefreshTokenExpiration()).thenReturn(Instant.now().plusSeconds(86400));
            when(jwtService.getAccessTokenExpirationSeconds()).thenReturn(3600L);
            when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArgument(0));

            AuthResponse response = authService.login(loginRequest, userAgent, ipAddress);

            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isEqualTo("access_token");
            assertThat(response.getRefreshToken()).isEqualTo("refresh_token");
            assertThat(response.getUser().getEmail()).isEqualTo(testUser.getEmail());
        }

        @Test
        @DisplayName("should throw for invalid credentials")
        void shouldThrowForInvalidCredentials() {
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenThrow(new BadCredentialsException("Invalid credentials"));

            assertThatThrownBy(() -> authService.login(loginRequest, userAgent, ipAddress))
                    .isInstanceOf(BadCredentialsException.class);
        }

        @Test
        @DisplayName("should update last login timestamp")
        void shouldUpdateLastLoginTimestamp() {
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(new UsernamePasswordAuthenticationToken(testUser, null));
            when(jwtService.generateAccessToken(testUser)).thenReturn("access_token");
            when(jwtService.generateRefreshToken(testUser)).thenReturn("refresh_token");
            when(jwtService.getRefreshTokenExpiration()).thenReturn(Instant.now().plusSeconds(86400));
            when(jwtService.getAccessTokenExpirationSeconds()).thenReturn(3600L);
            when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArgument(0));

            authService.login(loginRequest, userAgent, ipAddress);

            verify(userRepository).updateLastLoginAt(eq(testUser.getId()), any(Instant.class));
        }
    }

    @Nested
    @DisplayName("refreshToken")
    class RefreshTokenTests {

        private RefreshToken validRefreshToken;

        @BeforeEach
        void setUp() {
            validRefreshToken = RefreshToken.builder()
                    .id(1L)
                    .token("valid_refresh_token")
                    .user(testUser)
                    .expiresAt(Instant.now().plusSeconds(86400))
                    .revoked(false)
                    .build();
        }

        @Test
        @DisplayName("should return new access token for valid refresh token")
        void shouldReturnNewAccessToken() {
            when(refreshTokenRepository.findValidToken(eq("valid_refresh_token"), any(Instant.class)))
                    .thenReturn(Optional.of(validRefreshToken));
            when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArgument(0));
            when(jwtService.generateAccessToken(testUser)).thenReturn("new_access_token");
            when(jwtService.generateRefreshToken(testUser)).thenReturn("new_refresh_token");
            when(jwtService.getRefreshTokenExpiration()).thenReturn(Instant.now().plusSeconds(86400));
            when(jwtService.getAccessTokenExpirationSeconds()).thenReturn(3600L);

            AuthResponse response = authService.refreshToken("valid_refresh_token", userAgent, ipAddress);

            assertThat(response.getAccessToken()).isEqualTo("new_access_token");
        }

        @Test
        @DisplayName("should rotate refresh token")
        void shouldRotateRefreshToken() {
            when(refreshTokenRepository.findValidToken(eq("valid_refresh_token"), any(Instant.class)))
                    .thenReturn(Optional.of(validRefreshToken));
            when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArgument(0));
            when(jwtService.generateAccessToken(testUser)).thenReturn("new_access_token");
            when(jwtService.generateRefreshToken(testUser)).thenReturn("new_refresh_token");
            when(jwtService.getRefreshTokenExpiration()).thenReturn(Instant.now().plusSeconds(86400));
            when(jwtService.getAccessTokenExpirationSeconds()).thenReturn(3600L);

            AuthResponse response = authService.refreshToken("valid_refresh_token", userAgent, ipAddress);

            assertThat(response.getRefreshToken()).isEqualTo("new_refresh_token");
            assertThat(validRefreshToken.isRevoked()).isTrue();
        }

        @Test
        @DisplayName("should throw for invalid refresh token")
        void shouldThrowForInvalidToken() {
            when(refreshTokenRepository.findValidToken(eq("invalid_token"), any(Instant.class)))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.refreshToken("invalid_token", userAgent, ipAddress))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessageContaining("Invalid");
        }
    }

    @Nested
    @DisplayName("logout")
    class Logout {

        @Test
        @DisplayName("should revoke refresh token")
        void shouldRevokeToken() {
            authService.logout("refresh_token");

            verify(refreshTokenRepository).revokeToken("refresh_token");
        }
    }

    @Nested
    @DisplayName("logoutAll")
    class LogoutAll {

        @Test
        @DisplayName("should revoke all user refresh tokens")
        void shouldRevokeAllTokens() {
            authService.logoutAll(testUser);

            verify(refreshTokenRepository).revokeAllUserTokens(testUser);
        }
    }
}
