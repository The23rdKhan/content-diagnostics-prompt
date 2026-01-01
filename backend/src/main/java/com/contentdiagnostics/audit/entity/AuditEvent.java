package com.contentdiagnostics.audit.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;

/**
 * Immutable audit log entry for tracking security-sensitive operations.
 *
 * This entity is append-only - records should never be updated or deleted.
 * Used for compliance, security auditing, and incident investigation.
 */
@Entity
@Table(name = "audit_events", indexes = {
        @Index(name = "idx_audit_events_actor_id", columnList = "actor_id"),
        @Index(name = "idx_audit_events_action", columnList = "action"),
        @Index(name = "idx_audit_events_target_type", columnList = "target_type"),
        @Index(name = "idx_audit_events_target_id", columnList = "target_id"),
        @Index(name = "idx_audit_events_created_at", columnList = "created_at")
})
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Unique correlation ID for request tracing.
     */
    @Column(name = "correlation_id", nullable = false, length = 36)
    private String correlationId;

    /**
     * User ID who performed the action (null for system actions).
     */
    @Column(name = "actor_id")
    private Long actorId;

    /**
     * Email of the actor for readability.
     */
    @Column(name = "actor_email", length = 255)
    private String actorEmail;

    /**
     * Role of the actor at time of action.
     */
    @Column(name = "actor_role", length = 20)
    private String actorRole;

    /**
     * The action performed (e.g., REVIEWER_UPDATE, CREDIT_ISSUE, PAYOUT_RELEASE).
     */
    @Column(name = "action", nullable = false, length = 50)
    private String action;

    /**
     * Type of entity being acted upon (e.g., REVIEWER, CREATOR, PAYOUT).
     */
    @Column(name = "target_type", length = 50)
    private String targetType;

    /**
     * ID of the entity being acted upon.
     */
    @Column(name = "target_id")
    private Long targetId;

    /**
     * Human-readable description of what changed.
     */
    @Column(name = "description", length = 500)
    private String description;

    /**
     * JSON object containing the old values before the change.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "old_values", columnDefinition = "jsonb")
    private Map<String, Object> oldValues;

    /**
     * JSON object containing the new values after the change.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "new_values", columnDefinition = "jsonb")
    private Map<String, Object> newValues;

    /**
     * IP address of the request origin.
     */
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    /**
     * User agent string from the request.
     */
    @Column(name = "user_agent", length = 500)
    private String userAgent;

    /**
     * Result of the action (SUCCESS, FAILURE, DENIED).
     */
    @Column(name = "result", nullable = false, length = 20)
    @Builder.Default
    private String result = "SUCCESS";

    /**
     * Error message if the action failed.
     */
    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    /**
     * Timestamp when the event occurred.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
