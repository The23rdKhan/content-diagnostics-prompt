package com.contentdiagnostics.auth.controller;

import com.contentdiagnostics.auth.dto.*;
import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.auth.service.AuthService;
import com.contentdiagnostics.common.dto.ApiResponse;
import com.contentdiagnostics.common.exception.BadRequestException;
import com.contentdiagnostics.common.util.CookieUtils;
import com.contentdiagnostics.common.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 */
@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CookieUtils cookieUtils;

    /**
     * Register a new user.
     * POST /api/auth/signup
     *
     * Sets refresh token as HttpOnly cookie for security.
     * Returns access token in response body.
     */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AccessTokenResponse>> signUp(
            @Valid @RequestBody SignUpRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        log.info("Signup request for email: {}, role: {}", request.getEmail(), request.getRole());

        String userAgent = httpRequest.getHeader("User-Agent");
        String ipAddress = getClientIp(httpRequest);

        AuthResponse authResponse = authService.signUp(request, userAgent, ipAddress);

        // Set refresh token as HttpOnly cookie
        cookieUtils.setRefreshTokenCookie(httpResponse, authResponse.getRefreshToken());

        // Return access token only (no refresh token in body)
        AccessTokenResponse response = AccessTokenResponse.fromAuthResponse(authResponse);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully", response));
    }

    /**
     * Authenticate a user.
     * POST /api/auth/login
     *
     * Sets refresh token as HttpOnly cookie for security.
     * Returns access token in response body.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AccessTokenResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        log.info("Login request for email: {}", request.getEmail());

        String userAgent = httpRequest.getHeader("User-Agent");
        String ipAddress = getClientIp(httpRequest);

        AuthResponse authResponse = authService.login(request, userAgent, ipAddress);

        // Set refresh token as HttpOnly cookie
        cookieUtils.setRefreshTokenCookie(httpResponse, authResponse.getRefreshToken());

        // Return access token only (no refresh token in body)
        AccessTokenResponse response = AccessTokenResponse.fromAuthResponse(authResponse);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Refresh access token.
     * POST /api/auth/refresh
     *
     * Reads refresh token from HttpOnly cookie.
     * Sets new refresh token cookie (token rotation).
     * Returns new access token in response body.
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AccessTokenResponse>> refreshToken(
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        log.debug("Token refresh request");

        // Extract refresh token from HttpOnly cookie
        String refreshToken = cookieUtils.extractRefreshToken(httpRequest);
        if (refreshToken == null) {
            throw new BadRequestException("No refresh token found", "MISSING_REFRESH_TOKEN");
        }

        String userAgent = httpRequest.getHeader("User-Agent");
        String ipAddress = getClientIp(httpRequest);

        AuthResponse authResponse = authService.refreshToken(refreshToken, userAgent, ipAddress);

        // Set new refresh token cookie (token rotation)
        cookieUtils.setRefreshTokenCookie(httpResponse, authResponse.getRefreshToken());

        // Return new access token only
        AccessTokenResponse response = AccessTokenResponse.fromAuthResponse(authResponse);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Logout user (revoke refresh token).
     * POST /api/auth/logout
     *
     * Reads refresh token from HttpOnly cookie and revokes it.
     * Clears the refresh token cookie.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        log.debug("Logout request");

        // Try to revoke the refresh token from cookie
        String refreshToken = cookieUtils.extractRefreshToken(httpRequest);
        if (refreshToken != null && !refreshToken.isBlank()) {
            authService.logout(refreshToken);
        }

        // If user is authenticated, logout from all devices
        SecurityUtils.getCurrentUserOptional().ifPresent(authService::logoutAll);

        // Clear the refresh token cookie
        cookieUtils.clearRefreshTokenCookie(httpResponse);

        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    /**
     * Get current user profile.
     * GET /api/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser() {
        User user = SecurityUtils.getCurrentUser();
        UserProfileResponse profile = authService.getCurrentUserProfile(user);

        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    /**
     * Request password reset.
     * POST /api/auth/forgot-password
     *
     * Sends password reset email if email exists.
     * Always returns success to prevent email enumeration.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        log.info("Password reset requested for email: {}", request.getEmail());
        authService.forgotPassword(request.getEmail());

        return ResponseEntity.ok(ApiResponse.success(
                "If an account with that email exists, we've sent password reset instructions."));
    }

    /**
     * Reset password with token.
     * POST /api/auth/reset-password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        log.info("Password reset attempt with token");
        authService.resetPassword(request.getToken(), request.getNewPassword());

        return ResponseEntity.ok(ApiResponse.success("Password has been reset successfully. You can now log in."));
    }

    /**
     * Verify email address with token.
     * GET /api/auth/verify-email?token=xxx
     */
    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestParam String token) {
        log.info("Email verification attempt with token");
        authService.verifyEmail(token);

        return ResponseEntity.ok(ApiResponse.success("Email verified successfully. Thank you!"));
    }

    /**
     * Resend verification email.
     * POST /api/auth/resend-verification
     *
     * Requires authentication.
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerification() {
        User user = SecurityUtils.getCurrentUser();

        log.info("Resend verification request for user: {}", user.getId());
        authService.resendVerification(user);

        return ResponseEntity.ok(ApiResponse.success("Verification email sent. Please check your inbox."));
    }

    /**
     * Extract client IP address from request.
     */
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
