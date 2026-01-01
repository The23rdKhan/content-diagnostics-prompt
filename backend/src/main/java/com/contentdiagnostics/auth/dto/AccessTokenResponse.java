package com.contentdiagnostics.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Objects;

/**
 * Response DTO for authentication endpoints when refresh token is sent via HttpOnly cookie.
 * This DTO excludes the refresh token from the JSON response body for security.
 *
 * The refresh token is instead set as an HttpOnly cookie by the controller.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccessTokenResponse {

    /**
     * JWT access token for API authorization.
     * Should be stored in memory only (not localStorage).
     */
    private String accessToken;

    /**
     * Token type, always "Bearer".
     */
    private String tokenType;

    /**
     * Access token expiration time in seconds.
     */
    private long expiresIn;

    /**
     * Basic user information.
     */
    private AuthResponse.UserDto user;

    /**
     * Creates an AccessTokenResponse from an AuthResponse.
     * Excludes the refresh token which will be sent via cookie.
     *
     * @param authResponse the full auth response containing refresh token
     * @return AccessTokenResponse without refresh token
     */
    public static AccessTokenResponse fromAuthResponse(AuthResponse authResponse) {
        Objects.requireNonNull(authResponse, "AuthResponse cannot be null");

        return AccessTokenResponse.builder()
                .accessToken(authResponse.getAccessToken())
                .tokenType(authResponse.getTokenType())
                .expiresIn(authResponse.getExpiresIn())
                .user(authResponse.getUser())
                .build();
    }
}
