package com.contentdiagnostics.audit.repository;

import com.contentdiagnostics.audit.entity.AuditEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

/**
 * Repository for audit events.
 *
 * Note: This repository intentionally does not include update or delete methods
 * as audit logs should be immutable.
 */
@Repository
public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {

    /**
     * Find events by actor (admin who performed actions).
     */
    Page<AuditEvent> findByActorIdOrderByCreatedAtDesc(Long actorId, Pageable pageable);

    /**
     * Find events by target entity.
     */
    Page<AuditEvent> findByTargetTypeAndTargetIdOrderByCreatedAtDesc(
            String targetType, Long targetId, Pageable pageable);

    /**
     * Find events by action type.
     */
    Page<AuditEvent> findByActionOrderByCreatedAtDesc(String action, Pageable pageable);

    /**
     * Find events within a time range.
     */
    @Query("SELECT e FROM AuditEvent e WHERE e.createdAt BETWEEN :start AND :end ORDER BY e.createdAt DESC")
    Page<AuditEvent> findByTimeRange(@Param("start") Instant start,
                                     @Param("end") Instant end,
                                     Pageable pageable);

    /**
     * Find events by correlation ID (for tracing a single request).
     */
    List<AuditEvent> findByCorrelationIdOrderByCreatedAtAsc(String correlationId);

    /**
     * Find failed actions for security monitoring.
     */
    @Query("SELECT e FROM AuditEvent e WHERE e.result = 'FAILURE' OR e.result = 'DENIED' " +
           "ORDER BY e.createdAt DESC")
    Page<AuditEvent> findFailedActions(Pageable pageable);

    /**
     * Count events by action type within time range (for metrics).
     */
    @Query("SELECT e.action, COUNT(e) FROM AuditEvent e " +
           "WHERE e.createdAt BETWEEN :start AND :end " +
           "GROUP BY e.action ORDER BY COUNT(e) DESC")
    List<Object[]> countByActionInTimeRange(@Param("start") Instant start,
                                            @Param("end") Instant end);
}
