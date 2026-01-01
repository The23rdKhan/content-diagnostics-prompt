package com.contentdiagnostics.auth.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.auth.entity.UserRole;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("JwtService")
class JwtServiceTest {

    private JwtService jwtService;
    private User testUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        // Set test configuration values
        ReflectionTestUtils.setField(jwtService, "jwtSecret",
            "test-secret-key-that-is-at-least-256-bits-long-for-hs256-algorithm");
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 3600000L); // 1 hour
        ReflectionTestUtils.setField(jwtService, "refreshExpirationMs", 604800000L); // 7 days

        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setRole(UserRole.CREATOR);
    }

    @Nested
    @DisplayName("generateAccessToken")
    class GenerateAccessToken {

        @Test
        @DisplayName("should generate a valid JWT token")
        void shouldGenerateValidToken() {
            String token = jwtService.generateAccessToken(testUser);

            assertThat(token).isNotNull();
            assertThat(token.split("\\.")).hasSize(3); // JWT has 3 parts
        }

        @Test
        @DisplayName("should include user email as subject")
        void shouldIncludeEmailAsSubject() {
            String token = jwtService.generateAccessToken(testUser);
            String extractedEmail = jwtService.extractUsername(token);

            assertThat(extractedEmail).isEqualTo(testUser.getEmail());
        }

        @Test
        @DisplayName("should include user role in claims")
        void shouldIncludeRoleInClaims() {
            String token = jwtService.generateAccessToken(testUser);
            String role = jwtService.extractClaim(token, claims -> claims.get("role", String.class));

            assertThat(role).isEqualTo(testUser.getRole().name());
        }

        @Test
        @DisplayName("should include user id in claims")
        void shouldIncludeUserIdInClaims() {
            String token = jwtService.generateAccessToken(testUser);
            String userId = jwtService.extractClaim(token, claims -> claims.get("userId", String.class));

            assertThat(userId).isEqualTo(testUser.getId().toString());
        }
    }

    @Nested
    @DisplayName("validateToken")
    class ValidateToken {

        @Test
        @DisplayName("should return true for valid token")
        void shouldReturnTrueForValidToken() {
            String token = jwtService.generateAccessToken(testUser);

            boolean isValid = jwtService.isTokenValid(token, testUser);

            assertThat(isValid).isTrue();
        }

        @Test
        @DisplayName("should return false for token with different user")
        void shouldReturnFalseForDifferentUser() {
            String token = jwtService.generateAccessToken(testUser);

            User differentUser = new User();
            differentUser.setEmail("different@example.com");

            boolean isValid = jwtService.isTokenValid(token, differentUser);

            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("should throw exception for malformed token")
        void shouldThrowExceptionForMalformedToken() {
            String malformedToken = "not.a.valid.jwt";

            assertThatThrownBy(() -> jwtService.extractUsername(malformedToken))
                .isInstanceOf(MalformedJwtException.class);
        }

        @Test
        @DisplayName("should throw exception for token with invalid signature")
        void shouldThrowExceptionForInvalidSignature() {
            String token = jwtService.generateAccessToken(testUser);
            // Tamper with the signature
            String tamperedToken = token.substring(0, token.lastIndexOf('.') + 1) + "invalidsignature";

            assertThatThrownBy(() -> jwtService.extractUsername(tamperedToken))
                .isInstanceOf(SignatureException.class);
        }

        @Test
        @DisplayName("should throw exception for expired token")
        void shouldThrowExceptionForExpiredToken() {
            // Set expiration to -1 second (already expired)
            ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", -1000L);
            String expiredToken = jwtService.generateAccessToken(testUser);

            assertThatThrownBy(() -> jwtService.extractUsername(expiredToken))
                .isInstanceOf(ExpiredJwtException.class);
        }
    }

    @Nested
    @DisplayName("generateRefreshToken")
    class GenerateRefreshToken {

        @Test
        @DisplayName("should generate a unique refresh token string")
        void shouldGenerateUniqueRefreshToken() {
            String token1 = jwtService.generateRefreshTokenString();
            String token2 = jwtService.generateRefreshTokenString();

            assertThat(token1).isNotNull();
            assertThat(token2).isNotNull();
            assertThat(token1).isNotEqualTo(token2);
        }

        @Test
        @DisplayName("refresh token should be valid UUID format")
        void refreshTokenShouldBeValidUuid() {
            String token = jwtService.generateRefreshTokenString();

            // Should not throw exception
            UUID.fromString(token);
        }
    }

    @Nested
    @DisplayName("extractClaims")
    class ExtractClaims {

        @Test
        @DisplayName("should extract expiration date")
        void shouldExtractExpirationDate() {
            String token = jwtService.generateAccessToken(testUser);

            var expiration = jwtService.extractExpiration(token);

            assertThat(expiration).isNotNull();
            assertThat(expiration.getTime()).isGreaterThan(System.currentTimeMillis());
        }

        @Test
        @DisplayName("should extract all claims")
        void shouldExtractAllClaims() {
            String token = jwtService.generateAccessToken(testUser);

            var claims = jwtService.extractAllClaims(token);

            assertThat(claims).isNotNull();
            assertThat(claims.getSubject()).isEqualTo(testUser.getEmail());
            assertThat(claims.get("role")).isEqualTo(testUser.getRole().name());
            assertThat(claims.get("userId")).isEqualTo(testUser.getId().toString());
        }
    }
}
