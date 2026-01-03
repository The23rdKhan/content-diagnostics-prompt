package com.contentdiagnostics.auth.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiting filter for authentication endpoints.
 * Uses bucket4j for token bucket rate limiting per IP address.
 */
@Slf4j
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Value("${app.rate-limit.login-attempts-per-minute:5}")
    private int loginAttemptsPerMinute;

    @Value("${app.rate-limit.signup-attempts-per-minute:3}")
    private int signupAttemptsPerMinute;

    @Value("${app.rate-limit.password-reset-per-hour:3}")
    private int passwordResetPerHour;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Only rate limit POST requests to auth endpoints
        if (!"POST".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Determine rate limit based on endpoint
        RateLimitConfig config = getRateLimitConfig(path);
        if (config == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIP(request);
        String bucketKey = clientIp + ":" + config.endpoint;

        Bucket bucket = buckets.computeIfAbsent(bucketKey, k -> createBucket(config));

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            log.warn("Rate limit exceeded for {} on endpoint {}", clientIp, path);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("""
                {
                    "success": false,
                    "error": {
                        "code": "RATE_LIMIT_EXCEEDED",
                        "message": "Too many requests. Please try again later."
                    }
                }
                """);
        }
    }

    private RateLimitConfig getRateLimitConfig(String path) {
        if (path.endsWith("/auth/login")) {
            return new RateLimitConfig("login", loginAttemptsPerMinute, Duration.ofMinutes(1));
        } else if (path.endsWith("/auth/signup")) {
            return new RateLimitConfig("signup", signupAttemptsPerMinute, Duration.ofMinutes(1));
        } else if (path.endsWith("/auth/forgot-password") || path.endsWith("/auth/reset-password")) {
            return new RateLimitConfig("password-reset", passwordResetPerHour, Duration.ofHours(1));
        }
        return null;
    }

    private Bucket createBucket(RateLimitConfig config) {
        Bandwidth limit = Bandwidth.classic(
                config.tokens,
                Refill.greedy(config.tokens, config.duration)
        );
        return Bucket.builder().addLimit(limit).build();
    }

    private String getClientIP(HttpServletRequest request) {
        // Check for forwarded IP (behind load balancer/proxy)
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // Take the first IP in the chain (original client)
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIP = request.getHeader("X-Real-IP");
        if (xRealIP != null && !xRealIP.isEmpty()) {
            return xRealIP;
        }

        return request.getRemoteAddr();
    }

    private record RateLimitConfig(String endpoint, int tokens, Duration duration) {}
}
