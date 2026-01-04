package com.contentdiagnostics.notifications.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.notifications.dto.EmailPreferenceDto;
import com.contentdiagnostics.notifications.dto.NotificationDto;
import com.contentdiagnostics.notifications.entity.EmailPreference;
import com.contentdiagnostics.notifications.entity.Notification;
import com.contentdiagnostics.notifications.entity.NotificationType;
import com.contentdiagnostics.notifications.event.NotificationCreatedEvent;
import com.contentdiagnostics.notifications.repository.EmailPreferenceRepository;
import com.contentdiagnostics.notifications.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for notification operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailPreferenceRepository emailPreferenceRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final EmailTemplateService emailTemplateService;

    /**
     * Get notifications for a user.
     */
    @Transactional(readOnly = true)
    public List<NotificationDto> getNotifications(User user) {
        List<Notification> notifications = notificationRepository.findTop50ByUserOrderByCreatedAtDesc(user);
        return notifications.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    /**
     * Get unread notification count.
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    /**
     * Mark notifications as read.
     */
    @Transactional
    public int markAsRead(User user, List<Long> notificationIds) {
        return notificationRepository.markAsRead(notificationIds, user);
    }

    /**
     * Mark all notifications as read.
     */
    @Transactional
    public int markAllAsRead(User user) {
        return notificationRepository.markAllAsRead(user);
    }

    /**
     * Create a notification with context data for email templates.
     * Email is sent asynchronously after transaction commits via event listener.
     *
     * @param user    the user to notify
     * @param type    the notification type
     * @param context context data for generating email content (e.g., "videoTitle", "amount")
     */
    @Transactional
    public NotificationDto createNotification(User user, NotificationType type, Map<String, Object> context) {
        // Generate content from template
        EmailTemplateService.EmailContent content = emailTemplateService.generateContent(type, context);

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(content.title())
                .message(content.message())
                .deepLink(content.deepLink())
                .isRead(false)
                .build();

        notification = notificationRepository.save(notification);

        log.info("Created notification {} ({}) for user {}", notification.getId(), type, user.getId());

        // Publish event for async email sending (handled after transaction commits)
        eventPublisher.publishEvent(NotificationCreatedEvent.builder()
                .userId(user.getId())
                .userEmail(user.getEmail())
                .type(type)
                .context(context)
                .build());

        return mapToDto(notification);
    }

    /**
     * Create a notification with explicit title/message (for backward compatibility).
     * Email is sent asynchronously after transaction commits via event listener.
     */
    @Transactional
    public NotificationDto createNotification(User user, NotificationType type, String title,
                                               String message, String deepLink) {
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .deepLink(deepLink)
                .isRead(false)
                .build();

        notification = notificationRepository.save(notification);

        log.info("Created notification {} ({}) for user {}", notification.getId(), type, user.getId());

        // Publish event for async email sending with empty context
        // (email template will use defaults)
        eventPublisher.publishEvent(NotificationCreatedEvent.builder()
                .userId(user.getId())
                .userEmail(user.getEmail())
                .type(type)
                .context(new HashMap<>())
                .build());

        return mapToDto(notification);
    }

    /**
     * Get email preferences for a user.
     */
    @Transactional(readOnly = true)
    public EmailPreferenceDto getEmailPreferences(User user) {
        EmailPreference prefs = emailPreferenceRepository.findByUser(user)
                .orElseGet(() -> createDefaultPreferences(user));

        return mapPrefsToDto(prefs);
    }

    /**
     * Update email preferences.
     */
    @Transactional
    public EmailPreferenceDto updateEmailPreferences(User user, EmailPreferenceDto request) {
        EmailPreference prefs = emailPreferenceRepository.findByUser(user)
                .orElseGet(() -> createDefaultPreferences(user));

        if (request.getReportReady() != null) prefs.setReportReady(request.getReportReady());
        if (request.getProgressUpdates() != null) prefs.setProgressUpdates(request.getProgressUpdates());
        if (request.getBillingAlerts() != null) prefs.setBillingAlerts(request.getBillingAlerts());
        if (request.getTaskUpdates() != null) prefs.setTaskUpdates(request.getTaskUpdates());
        if (request.getPayoutNotifications() != null) prefs.setPayoutNotifications(request.getPayoutNotifications());
        if (request.getPolicyUpdates() != null) prefs.setPolicyUpdates(request.getPolicyUpdates());
        if (request.getMarketingEmails() != null) prefs.setMarketingEmails(request.getMarketingEmails());

        prefs = emailPreferenceRepository.save(prefs);

        return mapPrefsToDto(prefs);
    }

    // --- Helper methods ---

    private EmailPreference createDefaultPreferences(User user) {
        EmailPreference prefs = EmailPreference.builder()
                .user(user)
                .build();
        return emailPreferenceRepository.save(prefs);
    }

    private NotificationDto mapToDto(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .deepLink(notification.getDeepLink())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    private EmailPreferenceDto mapPrefsToDto(EmailPreference prefs) {
        return EmailPreferenceDto.builder()
                .reportReady(prefs.getReportReady())
                .progressUpdates(prefs.getProgressUpdates())
                .billingAlerts(prefs.getBillingAlerts())
                .taskUpdates(prefs.getTaskUpdates())
                .payoutNotifications(prefs.getPayoutNotifications())
                .policyUpdates(prefs.getPolicyUpdates())
                .marketingEmails(prefs.getMarketingEmails())
                .build();
    }
}
