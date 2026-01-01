package com.contentdiagnostics.audit.service;

import com.contentdiagnostics.audit.entity.AuditEvent;
import com.contentdiagnostics.audit.repository.AuditEventRepository;
import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.common.config.CorrelationIdFilter;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Map;

/**
 * Service for recording audit events.
 *
 * Audit events are recorded asynchronously to avoid impacting request latency.
 * Events are persisted in a new transaction to ensure they are saved even if
 * the main transaction fails.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditEventRepository auditEventRepository;

    /**
     * Record a successful admin action.
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordAdminAction(User actor,
                                  String action,
                                  String targetType,
                                  Long targetId,
                                  String description,
                                  Map<String, Object> oldValues,
                                  Map<String, Object> newValues) {
        try {
            AuditEvent event = buildAuditEvent(actor, action, targetType, targetId, description)
                    .oldValues(oldValues)
                    .newValues(newValues)
                    .result("SUCCESS")
                    .build();

            auditEventRepository.save(event);

            log.info("Audit: {} performed {} on {}:{} - {}",
                    actor.getEmail(), action, targetType, targetId, description);

        } catch (Exception e) {
            // Audit logging should never fail the main operation
            log.error("Failed to record audit event: {}", e.getMessage(), e);
        }
    }

    /**
     * Record a failed or denied action.
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordFailedAction(User actor,
                                   String action,
                                   String targetType,
                                   Long targetId,
                                   String errorMessage) {
        try {
            AuditEvent event = buildAuditEvent(actor, action, targetType, targetId, null)
                    .result("FAILURE")
                    .errorMessage(errorMessage)
                    .build();

            auditEventRepository.save(event);

            log.warn("Audit: {} failed {} on {}:{} - {}",
                    actor.getEmail(), action, targetType, targetId, errorMessage);

        } catch (Exception e) {
            log.error("Failed to record audit event: {}", e.getMessage(), e);
        }
    }

    /**
     * Record a security-related event (login, logout, permission denied).
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordSecurityEvent(User actor,
                                    String action,
                                    String description,
                                    String result) {
        try {
            AuditEvent event = buildAuditEvent(actor, action, null, null, description)
                    .result(result)
                    .build();

            auditEventRepository.save(event);

            log.info("Security Audit: {} - {} - {}",
                    actor != null ? actor.getEmail() : "anonymous", action, description);

        } catch (Exception e) {
            log.error("Failed to record security event: {}", e.getMessage(), e);
        }
    }

    /**
     * Record a system event (scheduled jobs, automated processes).
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordSystemEvent(String action,
                                  String targetType,
                                  Long targetId,
                                  String description) {
        try {
            AuditEvent event = AuditEvent.builder()
                    .correlationId(CorrelationIdFilter.getCurrentCorrelationId())
                    .actorEmail("SYSTEM")
                    .actorRole("SYSTEM")
                    .action(action)
                    .targetType(targetType)
                    .targetId(targetId)
                    .description(description)
                    .result("SUCCESS")
                    .build();

            auditEventRepository.save(event);

            log.debug("System Audit: {} on {}:{} - {}",
                    action, targetType, targetId, description);

        } catch (Exception e) {
            log.error("Failed to record system event: {}", e.getMessage(), e);
        }
    }

    /**
     * Build base audit event with common fields.
     */
    private AuditEvent.AuditEventBuilder buildAuditEvent(User actor,
                                                         String action,
                                                         String targetType,
                                                         Long targetId,
                                                         String description) {
        String correlationId = CorrelationIdFilter.getCurrentCorrelationId();
        String ipAddress = null;
        String userAgent = null;

        // Try to get request context
        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                ipAddress = getClientIpAddress(request);
                userAgent = request.getHeader("User-Agent");
                if (userAgent != null && userAgent.length() > 500) {
                    userAgent = userAgent.substring(0, 500);
                }
            }
        } catch (Exception e) {
            // Ignore - we may be in async context without request
        }

        return AuditEvent.builder()
                .correlationId(correlationId)
                .actorId(actor != null ? actor.getId() : null)
                .actorEmail(actor != null ? actor.getEmail() : null)
                .actorRole(actor != null ? actor.getRole().name() : null)
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .description(description)
                .ipAddress(ipAddress)
                .userAgent(userAgent);
    }

    /**
     * Get client IP, handling proxies.
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // Take first IP in chain (original client)
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
