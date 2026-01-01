package com.contentdiagnostics.common.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Filter that adds correlation ID and request context to MDC for distributed tracing.
 *
 * MDC keys populated:
 * - correlationId: Unique request identifier (from header or generated)
 * - requestPath: HTTP request path
 * - requestMethod: HTTP method (GET, POST, etc.)
 *
 * User context (userId, userRole) is added by JwtAuthenticationFilter after auth.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdFilter extends OncePerRequestFilter {

    public static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    public static final String CORRELATION_ID_MDC_KEY = "correlationId";
    public static final String REQUEST_PATH_MDC_KEY = "requestPath";
    public static final String REQUEST_METHOD_MDC_KEY = "requestMethod";
    public static final String USER_ID_MDC_KEY = "userId";
    public static final String USER_ROLE_MDC_KEY = "userRole";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Get correlation ID from header or generate new one
        String correlationId = request.getHeader(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }

        try {
            // Add correlation ID to MDC
            MDC.put(CORRELATION_ID_MDC_KEY, correlationId);

            // Add request context to MDC
            MDC.put(REQUEST_PATH_MDC_KEY, request.getRequestURI());
            MDC.put(REQUEST_METHOD_MDC_KEY, request.getMethod());

            // Add to response headers for client correlation
            response.setHeader(CORRELATION_ID_HEADER, correlationId);

            filterChain.doFilter(request, response);
        } finally {
            // Clean up all MDC keys
            MDC.remove(CORRELATION_ID_MDC_KEY);
            MDC.remove(REQUEST_PATH_MDC_KEY);
            MDC.remove(REQUEST_METHOD_MDC_KEY);
            MDC.remove(USER_ID_MDC_KEY);
            MDC.remove(USER_ROLE_MDC_KEY);
        }
    }

    /**
     * Utility method to get current correlation ID from MDC.
     * Useful for passing to async operations.
     */
    public static String getCurrentCorrelationId() {
        String id = MDC.get(CORRELATION_ID_MDC_KEY);
        return id != null ? id : UUID.randomUUID().toString();
    }

    /**
     * Utility method to set user context in MDC.
     * Called from JwtAuthenticationFilter after successful authentication.
     */
    public static void setUserContext(Long userId, String role) {
        if (userId != null) {
            MDC.put(USER_ID_MDC_KEY, userId.toString());
        }
        if (role != null) {
            MDC.put(USER_ROLE_MDC_KEY, role);
        }
    }
}
