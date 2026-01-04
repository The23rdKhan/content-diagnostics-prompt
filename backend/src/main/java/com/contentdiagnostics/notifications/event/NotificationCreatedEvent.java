package com.contentdiagnostics.notifications.event;

import com.contentdiagnostics.notifications.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event published when a notification is created.
 * Used to trigger async email sending after transaction commits.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationCreatedEvent {
    private Long userId;
    private String userEmail;
    private NotificationType type;
    private String title;
    private String message;
    private String deepLink;
}
