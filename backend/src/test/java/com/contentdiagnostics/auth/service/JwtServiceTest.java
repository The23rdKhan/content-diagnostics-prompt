package com.contentdiagnostics.auth.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.auth.entity.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("JwtService")
class JwtServiceTest {

    private JwtService jwtService;
    private User testUser;

    @BeforeEach
    void setUp() {
        // Create JwtService with test configuration
        String secret = "test-secret-key-that-is-at-least-256-bits-long-for-hs256";
        String issuer = "content-diagnostics-test";
        long accessTokenExpirationMs = 900000; // 15 minutes
        long refreshTokenExpirationMs = 604800000; // 7 days

        jwtService = new JwtService(secret, issuer, accessTokenExpirationMs, refreshTokenExpirationMs);

        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setRole(UserRole.CREATOR);
    }

    @Nested
    @DisplayName("generateAccessToken")
    class GenerateAccessToken {

        @Test
        @DisplayName("should generate valid token")
        void shouldGenerateValidToken() {
            String token = jwtService.generateAccessToken(testUser);

            assertThat(token).isNotNull();
            assertThat(token).isNotEmpty();
            assertThat(jwtService.validateToken(token)).isTrue();
        }

        @Test
        @DisplayName("should include user ID in token")
        void shouldIncludeUserId() {
            String token = jwtService.generateAccessToken(testUser);

            Long extractedId = jwtService.extractUserId(token);
            assertThat(extractedId).isEqualTo(testUser.getId());
        }

        @Test
        @DisplayName("should include email in token")
        void shouldIncludeEmail() {
            String token = jwtService.generateAccessToken(testUser);

            String extractedEmail = jwtService.extractEmail(token);
            assertThat(extractedEmail).isEqualTo(testUser.getEmail());
        }

        @Test
        @DisplayName("should include role in token")
        void shouldIncludeRole() {
            String token = jwtService.generateAccessToken(testUser);

            String extractedRole = jwtService.extractRole(token);
            assertThat(extractedRole).isEqualTo(testUser.getRole().name());
        }
    }

    @Nested
    @DisplayName("generateRefreshToken")
    class GenerateRefreshToken {

        @Test
        @DisplayName("should generate valid token")
        void shouldGenerateValidToken() {
            String token = jwtService.generateRefreshToken(testUser);

            assertThat(token).isNotNull();
            assertThat(token).isNotEmpty();
            assertThat(jwtService.validateToken(token)).isTrue();
        }

        @Test
        @DisplayName("should generate unique tokens")
        void shouldGenerateUniqueTokens() {
            String token1 = jwtService.generateRefreshToken(testUser);
            String token2 = jwtService.generateRefreshToken(testUser);

            assertThat(token1).isNotEqualTo(token2);
        }
    }

    @Nested
    @DisplayName("validateToken")
    class ValidateToken {

        @Test
        @DisplayName("should return true for valid token")
        void shouldReturnTrueForValidToken() {
            String token = jwtService.generateAccessToken(testUser);

            boolean isValid = jwtService.validateToken(token);

            assertThat(isValid).isTrue();
        }

        @Test
        @DisplayName("should return false for malformed token")
        void shouldReturnFalseForMalformedToken() {
            boolean isValid = jwtService.validateToken("not-a-valid-jwt");

            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("should return false for tampered token")
        void shouldReturnFalseForTamperedToken() {
            String token = jwtService.generateAccessToken(testUser);
            String tamperedToken = token.substring(0, token.length() - 5) + "XXXXX";

            boolean isValid = jwtService.validateToken(tamperedToken);

            assertThat(isValid).isFalse();
        }
    }

    @Nested
    @DisplayName("validateTokenForUser")
    class ValidateTokenForUser {

        @Test
        @DisplayName("should return true for matching user")
        void shouldReturnTrueForMatchingUser() {
            String token = jwtService.generateAccessToken(testUser);

            boolean isValid = jwtService.validateTokenForUser(token, testUser);

            assertThat(isValid).isTrue();
        }

        @Test
        @DisplayName("should return false for different user")
        void shouldReturnFalseForDifferentUser() {
            String token = jwtService.generateAccessToken(testUser);

            User differentUser = new User();
            differentUser.setId(999L);
            differentUser.setEmail("other@example.com");

            boolean isValid = jwtService.validateTokenForUser(token, differentUser);

            assertThat(isValid).isFalse();
        }
    }

    @Nested
    @DisplayName("isTokenExpired")
    class IsTokenExpired {

        @Test
        @DisplayName("should return false for valid token")
        void shouldReturnFalseForValidToken() {
            String token = jwtService.generateAccessToken(testUser);

            boolean isExpired = jwtService.isTokenExpired(token);

            assertThat(isExpired).isFalse();
        }

        @Test
        @DisplayName("should return true for invalid token")
        void shouldReturnTrueForInvalidToken() {
            boolean isExpired = jwtService.isTokenExpired("invalid-token");

            assertThat(isExpired).isTrue();
        }
    }

    @Nested
    @DisplayName("extractExpiration")
    class ExtractExpiration {

        @Test
        @DisplayName("should return future instant for valid token")
        void shouldReturnFutureInstant() {
            String token = jwtService.generateAccessToken(testUser);

            Instant expiration = jwtService.extractExpiration(token);

            assertThat(expiration).isAfter(Instant.now());
        }
    }

    @Nested
    @DisplayName("getAccessTokenExpirationSeconds")
    class GetAccessTokenExpirationSeconds {

        @Test
        @DisplayName("should return correct expiration in seconds")
        void shouldReturnCorrectExpiration() {
            long expirationSeconds = jwtService.getAccessTokenExpirationSeconds();

            // 15 minutes = 900 seconds
            assertThat(expirationSeconds).isEqualTo(900);
        }
    }

    @Nested
    @DisplayName("getRefreshTokenExpiration")
    class GetRefreshTokenExpiration {

        @Test
        @DisplayName("should return future instant")
        void shouldReturnFutureInstant() {
            Instant expiration = jwtService.getRefreshTokenExpiration();

            assertThat(expiration).isAfter(Instant.now());
        }
    }
}
