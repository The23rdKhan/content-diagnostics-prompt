package com.contentdiagnostics.notifications.dto;

import com.contentdiagnostics.notifications.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO for notification responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {

    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private String deepLink;
    private Boolean isRead;
    private Instant createdAt;
}
