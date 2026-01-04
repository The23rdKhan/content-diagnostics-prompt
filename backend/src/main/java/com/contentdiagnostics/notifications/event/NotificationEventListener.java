package com.contentdiagnostics.notifications.event;

import com.contentdiagnostics.notifications.entity.EmailPreference;
import com.contentdiagnostics.notifications.entity.NotificationType;
import com.contentdiagnostics.notifications.repository.EmailPreferenceRepository;
import com.contentdiagnostics.notifications.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Handles notification events after transaction commits.
 * Sends emails asynchronously to avoid blocking the main transaction.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final EmailService emailService;
    private final EmailPreferenceRepository emailPreferenceRepository;

    /**
     * Handle notification created event - send email if user has opted in.
     * Runs AFTER the transaction commits successfully, and asynchronously.
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleNotificationCreated(NotificationCreatedEvent event) {
        if (!emailService.isConfigured()) {
            return;
        }

        try {
            EmailPreference prefs = emailPreferenceRepository.findByUserId(event.getUserId())
                    .orElse(null);

            boolean shouldSendEmail = shouldSendEmailForType(event.getType(), prefs);

            if (shouldSendEmail) {
                emailService.sendNotificationEmail(
                        event.getUserEmail(),
                        event.getTitle(),
                        event.getMessage(),
                        event.getDeepLink()
                );
            } else {
                log.debug("Email disabled for notification type {} for user {}",
                        event.getType(), event.getUserId());
            }
        } catch (Exception e) {
            // Log but don't rethrow - email failure shouldn't affect the notification
            log.error("Failed to send notification email to user {}: {}",
                    event.getUserId(), e.getMessage(), e);
        }
    }

    /**
     * Determine if email should be sent based on notification type and user preferences.
     */
    private boolean shouldSendEmailForType(NotificationType type, EmailPreference prefs) {
        if (prefs == null) {
            // Use defaults - most notifications are enabled by default
            return type != NotificationType.POLICY_UPDATE;
        }

        return switch (type) {
            // Creator notifications
            case REPORT_READY -> prefs.getReportReady();
            case UPLOAD_RECEIVED, PROCESSING_UPDATE, AI_DIAGNOSTICS_COMPLETE, HUMAN_REVIEW_IN_PROGRESS ->
                    prefs.getProgressUpdates();
            case SUBSCRIPTION_BILLING, ADDON_CONFIRMATION -> prefs.getBillingAlerts();

            // Reviewer notifications
            case TASK_ACCEPTED, TASK_SUBMITTED, TASK_APPROVED, TASK_REJECTED,
                 QUALIFICATION_PASSED, QUALIFICATION_FAILED -> prefs.getTaskUpdates();
            case PAYOUT_PENDING, PAYOUT_RELEASED -> prefs.getPayoutNotifications();
            case POLICY_UPDATE -> prefs.getPolicyUpdates();
        };
    }
}
