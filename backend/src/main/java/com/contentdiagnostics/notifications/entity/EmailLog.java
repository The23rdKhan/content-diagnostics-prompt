package com.contentdiagnostics.notifications.entity;

import com.contentdiagnostics.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/**
 * Entity for tracking sent emails.
 */
@Entity
@Table(name = "email_logs", indexes = {
        @Index(name = "idx_email_logs_user", columnList = "user_id"),
        @Index(name = "idx_email_logs_status", columnList = "status"),
        @Index(name = "idx_email_logs_type", columnList = "notification_type"),
        @Index(name = "idx_email_logs_sent_at", columnList = "sent_at")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 255)
    private String recipientEmail;

    @Column(nullable = false, length = 255)
    private String subject;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", length = 50)
    private NotificationType notificationType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EmailStatus status = EmailStatus.PENDING;

    @Column(length = 500)
    private String errorMessage;

    @Column(name = "sent_at")
    private Instant sentAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    /**
     * Email delivery status.
     */
    public enum EmailStatus {
        PENDING,
        SENT,
        FAILED,
        SKIPPED  // User opted out
    }
}
