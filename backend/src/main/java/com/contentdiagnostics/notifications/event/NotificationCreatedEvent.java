package com.contentdiagnostics.notifications.event;

import com.contentdiagnostics.notifications.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

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

    /**
     * Context data for generating email content.
     * Keys vary by notification type (e.g., "videoTitle", "amount", "reviewerCount").
     */
    @Builder.Default
    private Map<String, Object> context = new HashMap<>();
}
