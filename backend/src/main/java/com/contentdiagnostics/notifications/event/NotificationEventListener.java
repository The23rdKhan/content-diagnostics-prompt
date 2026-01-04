package com.contentdiagnostics.notifications.event;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.auth.repository.UserRepository;
import com.contentdiagnostics.notifications.entity.EmailLog;
import com.contentdiagnostics.notifications.entity.EmailLog.EmailStatus;
import com.contentdiagnostics.notifications.entity.EmailPreference;
import com.contentdiagnostics.notifications.entity.NotificationType;
import com.contentdiagnostics.notifications.repository.EmailLogRepository;
import com.contentdiagnostics.notifications.repository.EmailPreferenceRepository;
import com.contentdiagnostics.notifications.service.EmailService;
import com.contentdiagnostics.notifications.service.EmailTemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.Instant;

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
    private final EmailTemplateService emailTemplateService;
    private final EmailLogRepository emailLogRepository;
    private final UserRepository userRepository;

    /**
     * Handle notification created event - send email if user has opted in.
     * Runs AFTER the transaction commits successfully, and asynchronously.
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleNotificationCreated(NotificationCreatedEvent event) {
        // Generate email content from template
        EmailTemplateService.EmailContent content = emailTemplateService.generateContent(
                event.getType(),
                event.getContext()
        );

        // Get user for logging
        User user = userRepository.findById(event.getUserId()).orElse(null);

        // Check if email service is configured
        if (!emailService.isConfigured()) {
            log.debug("Email service not configured, skipping email to {}", event.getUserEmail());
            return;
        }

        try {
            EmailPreference prefs = emailPreferenceRepository.findByUserId(event.getUserId())
                    .orElse(null);

            boolean shouldSendEmail = shouldSendEmailForType(event.getType(), prefs);

            if (shouldSendEmail) {
                // Attempt to send email
                boolean sent = emailService.sendNotificationEmail(
                        event.getUserEmail(),
                        content.title(),
                        content.message(),
                        content.deepLink()
                );

                // Log the email
                logEmail(user, event.getUserEmail(), content.subject(), event.getType(),
                        sent ? EmailStatus.SENT : EmailStatus.FAILED,
                        sent ? null : "Email service returned false");

                if (sent) {
                    log.debug("Sent {} email to user {}", event.getType(), event.getUserId());
                }
            } else {
                // Log as skipped (user opted out)
                logEmail(user, event.getUserEmail(), content.subject(), event.getType(),
                        EmailStatus.SKIPPED, "User opted out of this notification type");

                log.debug("Email disabled for notification type {} for user {}",
                        event.getType(), event.getUserId());
            }
        } catch (Exception e) {
            // Log the failure
            logEmail(user, event.getUserEmail(), content.subject(), event.getType(),
                    EmailStatus.FAILED, e.getMessage());

            log.error("Failed to send notification email to user {}: {}",
                    event.getUserId(), e.getMessage(), e);
        }
    }

    /**
     * Log an email to the database.
     */
    private void logEmail(User user, String recipientEmail, String subject,
                          NotificationType type, EmailStatus status, String errorMessage) {
        try {
            EmailLog emailLog = EmailLog.builder()
                    .user(user)
                    .recipientEmail(recipientEmail)
                    .subject(subject)
                    .notificationType(type)
                    .status(status)
                    .errorMessage(errorMessage)
                    .sentAt(status == EmailStatus.SENT ? Instant.now() : null)
                    .build();

            emailLogRepository.save(emailLog);
        } catch (Exception e) {
            // Don't let logging failure break the flow
            log.error("Failed to log email: {}", e.getMessage());
        }
    }

    /**
     * Determine if email should be sent based on notification type and user preferences.
     */
    private boolean shouldSendEmailForType(NotificationType type, EmailPreference prefs) {
        if (prefs == null) {
            // Use defaults - most notifications are enabled by default
            return type != NotificationType.POLICY_UPDATE && type != NotificationType.NEW_TASKS_AVAILABLE;
        }

        return switch (type) {
            // Common
            case WELCOME -> true; // Always send welcome emails

            // Creator notifications
            case REPORT_READY -> prefs.getReportReady();
            case UPLOAD_RECEIVED, PROCESSING_UPDATE, AI_DIAGNOSTICS_COMPLETE, HUMAN_REVIEW_IN_PROGRESS ->
                    prefs.getProgressUpdates();
            case SUBSCRIPTION_BILLING, ADDON_CONFIRMATION, LOW_CREDITS, SUBSCRIPTION_EXPIRING ->
                    prefs.getBillingAlerts();

            // Reviewer notifications
            case TASK_ACCEPTED, TASK_SUBMITTED, TASK_APPROVED, TASK_REJECTED,
                 QUALIFICATION_PASSED, QUALIFICATION_FAILED -> prefs.getTaskUpdates();
            case PAYOUT_PENDING, PAYOUT_RELEASED -> prefs.getPayoutNotifications();
            case POLICY_UPDATE -> prefs.getPolicyUpdates();
            case NEW_TASKS_AVAILABLE -> prefs.getTaskUpdates();
        };
    }
}
