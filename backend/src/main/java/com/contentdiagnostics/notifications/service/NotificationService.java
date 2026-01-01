package com.contentdiagnostics.notifications.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.notifications.dto.EmailPreferenceDto;
import com.contentdiagnostics.notifications.dto.NotificationDto;
import com.contentdiagnostics.notifications.entity.EmailPreference;
import com.contentdiagnostics.notifications.entity.Notification;
import com.contentdiagnostics.notifications.entity.NotificationType;
import com.contentdiagnostics.notifications.repository.EmailPreferenceRepository;
import com.contentdiagnostics.notifications.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
     * Create a notification.
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

        log.info("Created notification {} for user {}", notification.getId(), user.getId());

        // TODO: Check email preferences and send email if enabled

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
