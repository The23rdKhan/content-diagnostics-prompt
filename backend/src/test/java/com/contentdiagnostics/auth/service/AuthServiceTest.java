package com.contentdiagnostics.auth.service;

import com.contentdiagnostics.auth.dto.AuthResponse;
import com.contentdiagnostics.auth.dto.LoginRequest;
import com.contentdiagnostics.auth.dto.SignupRequest;
import com.contentdiagnostics.auth.entity.RefreshToken;
import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.auth.entity.UserRole;
import com.contentdiagnostics.auth.repository.RefreshTokenRepository;
import com.contentdiagnostics.auth.repository.UserRepository;
import com.contentdiagnostics.common.exception.ValidationException;
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

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

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

    private SignupRequest signupRequest;
    private LoginRequest loginRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        signupRequest = new SignupRequest();
        signupRequest.setEmail("test@example.com");
        signupRequest.setPassword("password123");
        signupRequest.setRole(UserRole.CREATOR);

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("hashedPassword");
        testUser.setRole(UserRole.CREATOR);
    }

    @Nested
    @DisplayName("signup")
    class Signup {

        @Test
        @DisplayName("should create new user and return tokens")
        void shouldCreateUserAndReturnTokens() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
            when(userRepository.save(any(User.class))).thenAnswer(i -> {
                User u = i.getArgument(0);
                u.setId(UUID.randomUUID());
                return u;
            });
            when(jwtService.generateAccessToken(any(User.class))).thenReturn("access_token");
            when(jwtService.generateRefreshTokenString()).thenReturn(UUID.randomUUID().toString());
            when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArgument(0));
            when(creatorProfileRepository.save(any(CreatorProfile.class))).thenAnswer(i -> i.getArgument(0));

            AuthResponse response = authService.signup(signupRequest);

            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isEqualTo("access_token");
            assertThat(response.getRefreshToken()).isNotNull();
            assertThat(response.getRole()).isEqualTo(UserRole.CREATOR);

            verify(userRepository).save(any(User.class));
            verify(creatorProfileRepository).save(any(CreatorProfile.class));
        }

        @Test
        @DisplayName("should create reviewer profile for reviewer role")
        void shouldCreateReviewerProfile() {
            signupRequest.setRole(UserRole.REVIEWER);

            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
            when(userRepository.save(any(User.class))).thenAnswer(i -> {
                User u = i.getArgument(0);
                u.setId(UUID.randomUUID());
                return u;
            });
            when(jwtService.generateAccessToken(any(User.class))).thenReturn("access_token");
            when(jwtService.generateRefreshTokenString()).thenReturn(UUID.randomUUID().toString());
            when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArgument(0));
            when(reviewerProfileRepository.save(any(ReviewerProfile.class))).thenAnswer(i -> i.getArgument(0));

            AuthResponse response = authService.signup(signupRequest);

            assertThat(response.getRole()).isEqualTo(UserRole.REVIEWER);
            verify(reviewerProfileRepository).save(any(ReviewerProfile.class));
            verify(creatorProfileRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw when email already exists")
        void shouldThrowWhenEmailExists() {
            when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(true);

            assertThatThrownBy(() -> authService.signup(signupRequest))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("email");
        }

        @Test
        @DisplayName("should hash password before saving")
        void shouldHashPassword() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode("password123")).thenReturn("hashedPassword123");
            when(userRepository.save(any(User.class))).thenAnswer(i -> {
                User u = i.getArgument(0);
                u.setId(UUID.randomUUID());
                return u;
            });
            when(jwtService.generateAccessToken(any(User.class))).thenReturn("access_token");
            when(jwtService.generateRefreshTokenString()).thenReturn(UUID.randomUUID().toString());
            when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArgument(0));
            when(creatorProfileRepository.save(any(CreatorProfile.class))).thenAnswer(i -> i.getArgument(0));

            authService.signup(signupRequest);

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());

            assertThat(userCaptor.getValue().getPasswordHash()).isEqualTo("hashedPassword123");
        }

        @Test
        @DisplayName("should initialize reviewer with quality score 100")
        void shouldInitializeReviewerWithFullScore() {
            signupRequest.setRole(UserRole.REVIEWER);

            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
            when(userRepository.save(any(User.class))).thenAnswer(i -> {
                User u = i.getArgument(0);
                u.setId(UUID.randomUUID());
                return u;
            });
            when(jwtService.generateAccessToken(any(User.class))).thenReturn("access_token");
            when(jwtService.generateRefreshTokenString()).thenReturn(UUID.randomUUID().toString());
            when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArgument(0));
            when(reviewerProfileRepository.save(any(ReviewerProfile.class))).thenAnswer(i -> i.getArgument(0));

            authService.signup(signupRequest);

            ArgumentCaptor<ReviewerProfile> profileCaptor = ArgumentCaptor.forClass(ReviewerProfile.class);
            verify(reviewerProfileRepository).save(profileCaptor.capture());

            assertThat(profileCaptor.getValue().getQualityScore()).isEqualTo(100);
            assertThat(profileCaptor.getValue().getIsLocked()).isFalse();
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
            when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(testUser));
            when(jwtService.generateAccessToken(testUser)).thenReturn("access_token");
            when(jwtService.generateRefreshTokenString()).thenReturn(UUID.randomUUID().toString());
            when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArgument(0));

            AuthResponse response = authService.login(loginRequest);

            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isEqualTo("access_token");
            assertThat(response.getRefreshToken()).isNotNull();
            assertThat(response.getEmail()).isEqualTo(testUser.getEmail());
        }

        @Test
        @DisplayName("should throw for invalid credentials")
        void shouldThrowForInvalidCredentials() {
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

            assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class);
        }

        @Test
        @DisplayName("should revoke existing refresh tokens on new login")
        void shouldRevokeExistingTokensOnLogin() {
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken(testUser, null));
            when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(testUser));
            when(jwtService.generateAccessToken(testUser)).thenReturn("access_token");
            when(jwtService.generateRefreshTokenString()).thenReturn(UUID.randomUUID().toString());
            when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArgument(0));

            authService.login(loginRequest);

            verify(refreshTokenRepository).revokeAllByUserId(testUser.getId());
        }
    }

    @Nested
    @DisplayName("refreshToken")
    class RefreshToken {

        private RefreshToken validRefreshToken;

        @BeforeEach
        void setUp() {
            validRefreshToken = new RefreshToken();
            validRefreshToken.setId(UUID.randomUUID());
            validRefreshToken.setToken(UUID.randomUUID().toString());
            validRefreshToken.setUser(testUser);
            validRefreshToken.setExpiresAt(Instant.now().plusSeconds(86400)); // 1 day
            validRefreshToken.setRevoked(false);
        }

        @Test
        @DisplayName("should return new access token for valid refresh token")
        void shouldReturnNewAccessToken() {
            when(refreshTokenRepository.findByToken(validRefreshToken.getToken()))
                .thenReturn(Optional.of(validRefreshToken));
            when(jwtService.generateAccessToken(testUser)).thenReturn("new_access_token");
            when(jwtService.generateRefreshTokenString()).thenReturn(UUID.randomUUID().toString());
            when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArgument(0));

            AuthResponse response = authService.refreshToken(validRefreshToken.getToken());

            assertThat(response.getAccessToken()).isEqualTo("new_access_token");
        }

        @Test
        @DisplayName("should rotate refresh token (issue new one)")
        void shouldRotateRefreshToken() {
            String newTokenString = UUID.randomUUID().toString();
            when(refreshTokenRepository.findByToken(validRefreshToken.getToken()))
                .thenReturn(Optional.of(validRefreshToken));
            when(jwtService.generateAccessToken(testUser)).thenReturn("new_access_token");
            when(jwtService.generateRefreshTokenString()).thenReturn(newTokenString);
            when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArgument(0));

            AuthResponse response = authService.refreshToken(validRefreshToken.getToken());

            assertThat(response.getRefreshToken()).isEqualTo(newTokenString);
            assertThat(response.getRefreshToken()).isNotEqualTo(validRefreshToken.getToken());

            // Verify old token was revoked
            assertThat(validRefreshToken.getRevoked()).isTrue();
        }

        @Test
        @DisplayName("should throw for expired refresh token")
        void shouldThrowForExpiredToken() {
            validRefreshToken.setExpiresAt(Instant.now().minusSeconds(3600)); // Expired
            when(refreshTokenRepository.findByToken(validRefreshToken.getToken()))
                .thenReturn(Optional.of(validRefreshToken));

            assertThatThrownBy(() -> authService.refreshToken(validRefreshToken.getToken()))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("expired");
        }

        @Test
        @DisplayName("should throw for revoked refresh token")
        void shouldThrowForRevokedToken() {
            validRefreshToken.setRevoked(true);
            when(refreshTokenRepository.findByToken(validRefreshToken.getToken()))
                .thenReturn(Optional.of(validRefreshToken));

            assertThatThrownBy(() -> authService.refreshToken(validRefreshToken.getToken()))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("revoked");
        }

        @Test
        @DisplayName("should throw for non-existent refresh token")
        void shouldThrowForNonExistentToken() {
            when(refreshTokenRepository.findByToken("invalid_token"))
                .thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.refreshToken("invalid_token"))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Invalid");
        }
    }

    @Nested
    @DisplayName("logout")
    class Logout {

        @Test
        @DisplayName("should revoke all user refresh tokens")
        void shouldRevokeAllTokens() {
            authService.logout(testUser);

            verify(refreshTokenRepository).revokeAllByUserId(testUser.getId());
        }
    }
}
