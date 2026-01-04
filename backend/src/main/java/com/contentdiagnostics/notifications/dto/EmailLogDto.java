package com.contentdiagnostics.notifications.dto;

import com.contentdiagnostics.notifications.entity.EmailLog;
import com.contentdiagnostics.notifications.entity.EmailLog.EmailStatus;
import com.contentdiagnostics.notifications.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO for email log responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailLogDto {

    private Long id;
    private Long userId;
    private String userEmail;
    private String recipientEmail;
    private String subject;
    private NotificationType notificationType;
    private EmailStatus status;
    private String errorMessage;
    private Instant sentAt;
    private Instant createdAt;

    /**
     * Create DTO from entity.
     */
    public static EmailLogDto fromEntity(EmailLog log) {
        return EmailLogDto.builder()
                .id(log.getId())
                .userId(log.getUser() != null ? log.getUser().getId() : null)
                .userEmail(log.getUser() != null ? log.getUser().getEmail() : null)
                .recipientEmail(log.getRecipientEmail())
                .subject(log.getSubject())
                .notificationType(log.getNotificationType())
                .status(log.getStatus())
                .errorMessage(log.getErrorMessage())
                .sentAt(log.getSentAt())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
