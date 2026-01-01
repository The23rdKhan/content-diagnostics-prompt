package com.contentdiagnostics.common.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.util.Objects;

/**
 * Utility class for managing HttpOnly refresh token cookies.
 *
 * Security features:
 * - HttpOnly: prevents JavaScript access (XSS protection)
 * - Secure: only sent over HTTPS in production
 * - SameSite=Lax: CSRF protection while allowing top-level navigation
 * - Path restricted to /api/auth: minimizes cookie exposure
 */
@Component
public class CookieUtils {

    public static final String REFRESH_TOKEN_COOKIE_NAME = "refresh_token";
    private static final String COOKIE_PATH = "/api/auth";

    private final boolean secure;
    private final String sameSite;
    private final int maxAgeSeconds;

    public CookieUtils(
            @Value("${app.cookie.secure:false}") boolean secure,
            @Value("${app.cookie.same-site:Lax}") String sameSite,
            @Value("${app.cookie.max-age-seconds:604800}") int maxAgeSeconds) {
        this.secure = secure;
        this.sameSite = sameSite;
        this.maxAgeSeconds = maxAgeSeconds;
    }

    /**
     * Creates and adds a refresh token cookie to the response.
     *
     * @param response HTTP response to add cookie to
     * @param refreshToken the refresh token value
     */
    public void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        Objects.requireNonNull(refreshToken, "Refresh token cannot be null");

        ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, refreshToken)
                .maxAge(maxAgeSeconds)
                .path(COOKIE_PATH)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }

    /**
     * Clears the refresh token cookie by setting max-age to 0.
     *
     * @param response HTTP response to add clear cookie to
     */
    public void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, "")
                .maxAge(0)
                .path(COOKIE_PATH)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }

    /**
     * Extracts the refresh token from request cookies.
     *
     * @param request HTTP request containing cookies
     * @return refresh token value, or null if not found
     */
    public String extractRefreshToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (REFRESH_TOKEN_COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    /**
     * Checks if a refresh token cookie is present in the request.
     *
     * @param request HTTP request to check
     * @return true if refresh token cookie exists
     */
    public boolean hasRefreshTokenCookie(HttpServletRequest request) {
        return extractRefreshToken(request) != null;
    }
}
