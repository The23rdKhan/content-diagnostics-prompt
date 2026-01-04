package com.contentdiagnostics.notifications.repository;

import com.contentdiagnostics.notifications.entity.EmailLog;
import com.contentdiagnostics.notifications.entity.EmailLog.EmailStatus;
import com.contentdiagnostics.notifications.entity.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

/**
 * Repository for email log operations.
 */
@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {

    /**
     * Find all email logs ordered by sent date descending.
     */
    Page<EmailLog> findAllByOrderBySentAtDesc(Pageable pageable);

    /**
     * Find email logs by status.
     */
    Page<EmailLog> findByStatusOrderBySentAtDesc(EmailStatus status, Pageable pageable);

    /**
     * Find email logs by notification type.
     */
    Page<EmailLog> findByNotificationTypeOrderBySentAtDesc(NotificationType type, Pageable pageable);

    /**
     * Find email logs by recipient email.
     */
    Page<EmailLog> findByRecipientEmailContainingIgnoreCaseOrderBySentAtDesc(String email, Pageable pageable);

    /**
     * Find email logs by user ID.
     */
    Page<EmailLog> findByUserIdOrderBySentAtDesc(Long userId, Pageable pageable);

    /**
     * Find email logs within a date range.
     */
    @Query("SELECT e FROM EmailLog e WHERE e.sentAt BETWEEN :start AND :end ORDER BY e.sentAt DESC")
    Page<EmailLog> findBySentAtBetween(@Param("start") Instant start, @Param("end") Instant end, Pageable pageable);

    /**
     * Count emails by status.
     */
    long countByStatus(EmailStatus status);

    /**
     * Count emails by notification type.
     */
    long countByNotificationType(NotificationType type);

    /**
     * Count emails sent today.
     */
    @Query("SELECT COUNT(e) FROM EmailLog e WHERE e.sentAt >= :todayStart AND e.status = 'SENT'")
    long countSentToday(@Param("todayStart") Instant todayStart);

    /**
     * Count failed emails today.
     */
    @Query("SELECT COUNT(e) FROM EmailLog e WHERE e.createdAt >= :todayStart AND e.status = 'FAILED'")
    long countFailedToday(@Param("todayStart") Instant todayStart);

    /**
     * Get email stats by type for dashboard.
     */
    @Query("SELECT e.notificationType, e.status, COUNT(e) FROM EmailLog e " +
           "WHERE e.createdAt >= :since GROUP BY e.notificationType, e.status")
    List<Object[]> getEmailStatsByType(@Param("since") Instant since);

    /**
     * Search emails with multiple filters.
     */
    @Query("SELECT e FROM EmailLog e WHERE " +
           "(:status IS NULL OR e.status = :status) AND " +
           "(:type IS NULL OR e.notificationType = :type) AND " +
           "(:email IS NULL OR LOWER(e.recipientEmail) LIKE LOWER(CONCAT('%', :email, '%'))) " +
           "ORDER BY e.sentAt DESC")
    Page<EmailLog> searchEmails(
            @Param("status") EmailStatus status,
            @Param("type") NotificationType type,
            @Param("email") String email,
            Pageable pageable
    );
}
