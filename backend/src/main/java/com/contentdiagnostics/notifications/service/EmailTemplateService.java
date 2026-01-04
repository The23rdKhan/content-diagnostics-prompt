package com.contentdiagnostics.notifications.service;

import com.contentdiagnostics.notifications.entity.NotificationType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Service for generating email content for different notification types.
 */
@Service
public class EmailTemplateService {

    @Value("${app.base-url:https://contentdiagnostics.com}")
    private String baseUrl;

    /**
     * Email content holder.
     */
    public record EmailContent(String subject, String title, String message, String deepLink) {}

    /**
     * Generate email content for a notification type with context data.
     */
    public EmailContent generateContent(NotificationType type, Map<String, Object> context) {
        return switch (type) {
            // Common
            case WELCOME -> generateWelcomeEmail(context);

            // Creator notifications
            case UPLOAD_RECEIVED -> generateUploadReceivedEmail(context);
            case AI_DIAGNOSTICS_COMPLETE -> generateAiCompleteEmail(context);
            case HUMAN_REVIEW_IN_PROGRESS -> generateHumanReviewInProgressEmail(context);
            case REPORT_READY -> generateReportReadyEmail(context);
            case SUBSCRIPTION_BILLING -> generateSubscriptionBillingEmail(context);
            case ADDON_CONFIRMATION -> generateAddonConfirmationEmail(context);
            case LOW_CREDITS -> generateLowCreditsEmail(context);
            case SUBSCRIPTION_EXPIRING -> generateSubscriptionExpiringEmail(context);
            case PROCESSING_UPDATE -> generateProcessingUpdateEmail(context);

            // Reviewer notifications
            case QUALIFICATION_PASSED -> generateQualificationPassedEmail(context);
            case QUALIFICATION_FAILED -> generateQualificationFailedEmail(context);
            case TASK_ACCEPTED -> generateTaskAcceptedEmail(context);
            case TASK_SUBMITTED -> generateTaskSubmittedEmail(context);
            case TASK_APPROVED -> generateTaskApprovedEmail(context);
            case TASK_REJECTED -> generateTaskRejectedEmail(context);
            case PAYOUT_PENDING -> generatePayoutPendingEmail(context);
            case PAYOUT_RELEASED -> generatePayoutReleasedEmail(context);
            case POLICY_UPDATE -> generatePolicyUpdateEmail(context);
            case NEW_TASKS_AVAILABLE -> generateNewTasksAvailableEmail(context);
        };
    }

    // --- Common ---

    private EmailContent generateWelcomeEmail(Map<String, Object> context) {
        String role = getString(context, "role", "user");
        boolean isCreator = "CREATOR".equalsIgnoreCase(role);

        if (isCreator) {
            return new EmailContent(
                    "Welcome to Content Diagnostics!",
                    "Welcome to Content Diagnostics!",
                    "Thanks for signing up! You're ready to get expert feedback on your video content. " +
                    "Upload your first video to receive AI-powered diagnostics and human reviewer insights. " +
                    "Our reviewers will help you understand how your content resonates with real audiences.",
                    baseUrl + "/dashboard"
            );
        } else {
            return new EmailContent(
                    "Welcome to Content Diagnostics - Reviewer Application",
                    "Your Reviewer Application is Received",
                    "Thanks for applying to become a reviewer! Complete the qualification test to start " +
                    "reviewing videos and earning money. You'll watch short video segments and provide " +
                    "valuable feedback to content creators.",
                    baseUrl + "/reviewers/qualification"
            );
        }
    }

    // --- Creator Notifications ---

    private EmailContent generateUploadReceivedEmail(Map<String, Object> context) {
        String videoTitle = getString(context, "videoTitle", "your video");

        return new EmailContent(
                "Your video is being processed",
                "Video Upload Received",
                String.format("We've received your video '%s' and it's now being processed. " +
                        "AI diagnostics will begin shortly. We'll notify you when human review starts.",
                        videoTitle),
                baseUrl + "/dashboard/videos"
        );
    }

    private EmailContent generateAiCompleteEmail(Map<String, Object> context) {
        String videoTitle = getString(context, "videoTitle", "your video");
        String sla = getString(context, "sla", "48 hours");

        return new EmailContent(
                "AI analysis complete for your video",
                "AI Analysis Complete",
                String.format("Our AI has finished analyzing '%s'. Human reviewers are now being assigned " +
                        "to provide detailed feedback. You'll receive your full report within %s.",
                        videoTitle, sla),
                baseUrl + "/dashboard/videos"
        );
    }

    private EmailContent generateHumanReviewInProgressEmail(Map<String, Object> context) {
        String videoTitle = getString(context, "videoTitle", "your video");
        int reviewerCount = getInt(context, "reviewerCount", 1);

        return new EmailContent(
                "Reviewers are watching your video",
                "Human Review In Progress",
                String.format("%d reviewer%s started reviewing '%s'. Feedback is coming in and " +
                        "we're compiling your report.",
                        reviewerCount, reviewerCount > 1 ? "s have" : " has", videoTitle),
                baseUrl + "/dashboard/videos"
        );
    }

    private EmailContent generateReportReadyEmail(Map<String, Object> context) {
        String videoTitle = getString(context, "videoTitle", "your video");
        int reviewerCount = getInt(context, "reviewerCount", 3);
        Long jobId = getLong(context, "jobId", null);

        String deepLink = jobId != null
                ? baseUrl + "/dashboard/videos/" + jobId + "/report"
                : baseUrl + "/dashboard/videos";

        return new EmailContent(
                "Your feedback report is ready!",
                "Your Report is Ready!",
                String.format("Great news! Your feedback report for '%s' is complete. " +
                        "%d reviewers provided insights on your content. " +
                        "View your detailed report to see engagement predictions, audience reactions, " +
                        "and actionable recommendations.",
                        videoTitle, reviewerCount),
                deepLink
        );
    }

    private EmailContent generateSubscriptionBillingEmail(Map<String, Object> context) {
        BigDecimal amount = getBigDecimal(context, "amount", BigDecimal.ZERO);
        String planName = getString(context, "planName", "your plan");
        String nextBillingDate = getString(context, "nextBillingDate", "next month");

        return new EmailContent(
                "Payment received - Thank you!",
                "Payment Confirmed",
                String.format("We've received your payment of $%.2f for your %s subscription. " +
                        "Your next billing date is %s. Thank you for using Content Diagnostics!",
                        amount, planName, nextBillingDate),
                baseUrl + "/dashboard/billing"
        );
    }

    private EmailContent generateAddonConfirmationEmail(Map<String, Object> context) {
        String addonName = getString(context, "addonName", "add-on");
        BigDecimal amount = getBigDecimal(context, "amount", BigDecimal.ZERO);
        String videoTitle = getString(context, "videoTitle", "your video");

        return new EmailContent(
                "Add-on purchased: " + addonName,
                "Add-on Purchase Confirmed",
                String.format("Your purchase of %s for $%.2f is confirmed. " +
                        "The add-on has been applied to '%s'. " +
                        "You'll see enhanced features in your report.",
                        addonName, amount, videoTitle),
                baseUrl + "/dashboard/videos"
        );
    }

    private EmailContent generateLowCreditsEmail(Map<String, Object> context) {
        int remainingCredits = getInt(context, "remainingCredits", 0);

        return new EmailContent(
                "Low credits warning - " + remainingCredits + " remaining",
                "Your Credits Are Running Low",
                String.format("You have %d credit%s remaining. Purchase more credits or upgrade your plan " +
                        "to continue getting feedback on your videos without interruption.",
                        remainingCredits, remainingCredits == 1 ? "" : "s"),
                baseUrl + "/dashboard/billing"
        );
    }

    private EmailContent generateSubscriptionExpiringEmail(Map<String, Object> context) {
        String planName = getString(context, "planName", "your plan");
        String expirationDate = getString(context, "expirationDate", "soon");

        return new EmailContent(
                "Your subscription expires " + expirationDate,
                "Subscription Expiring Soon",
                String.format("Your %s subscription will expire on %s. " +
                        "Renew now to keep your credits and continue receiving video feedback.",
                        planName, expirationDate),
                baseUrl + "/dashboard/billing"
        );
    }

    private EmailContent generateProcessingUpdateEmail(Map<String, Object> context) {
        String videoTitle = getString(context, "videoTitle", "your video");
        String status = getString(context, "status", "processing");

        return new EmailContent(
                "Processing update for your video",
                "Video Processing Update",
                String.format("Update on '%s': %s. We'll notify you when the next stage begins.",
                        videoTitle, status),
                baseUrl + "/dashboard/videos"
        );
    }

    // --- Reviewer Notifications ---

    private EmailContent generateQualificationPassedEmail(Map<String, Object> context) {
        return new EmailContent(
                "Welcome to Content Diagnostics - You're approved!",
                "Congratulations! You're Approved!",
                "You've passed the qualification test and can now start reviewing videos. " +
                "Head to your dashboard to claim your first task and start earning. " +
                "Remember to provide thoughtful, detailed feedback to maintain a high approval rate.",
                baseUrl + "/reviewers/dashboard"
        );
    }

    private EmailContent generateQualificationFailedEmail(Map<String, Object> context) {
        int retryDays = getInt(context, "retryDays", 7);

        return new EmailContent(
                "Qualification test results",
                "Qualification Results",
                String.format("Unfortunately, you didn't pass the qualification test this time. " +
                        "You can retake it in %d days. Review our guidelines and example feedback " +
                        "to improve your chances on the next attempt.",
                        retryDays),
                baseUrl + "/reviewers/guidelines"
        );
    }

    private EmailContent generateTaskAcceptedEmail(Map<String, Object> context) {
        int minutesRemaining = getInt(context, "minutesRemaining", 30);

        return new EmailContent(
                "Task claimed - " + minutesRemaining + " minutes to complete",
                "Task Claimed Successfully",
                String.format("You've claimed a new review task. You have %d minutes to complete it. " +
                        "Watch the video segment carefully and provide detailed feedback.",
                        minutesRemaining),
                baseUrl + "/reviewers/tasks/current"
        );
    }

    private EmailContent generateTaskSubmittedEmail(Map<String, Object> context) {
        return new EmailContent(
                "Task submitted - Under review",
                "Task Submitted",
                "Your review has been submitted and is being checked for quality. " +
                "You'll be notified once it's approved. In the meantime, you can claim another task.",
                baseUrl + "/reviewers/dashboard"
        );
    }

    private EmailContent generateTaskApprovedEmail(Map<String, Object> context) {
        BigDecimal amount = getBigDecimal(context, "amount", BigDecimal.ZERO);
        BigDecimal totalBalance = getBigDecimal(context, "totalBalance", BigDecimal.ZERO);

        return new EmailContent(
                String.format("Task approved - $%.2f earned!", amount),
                "Task Approved!",
                String.format("Your review has been approved! $%.2f has been added to your balance. " +
                        "Your current balance is $%.2f. Keep up the great work!",
                        amount, totalBalance),
                baseUrl + "/reviewers/dashboard"
        );
    }

    private EmailContent generateTaskRejectedEmail(Map<String, Object> context) {
        String reason = getString(context, "reason", "Quality standards not met");
        Long taskId = getLong(context, "taskId", null);

        return new EmailContent(
                "Task feedback - Needs improvement",
                "Task Not Approved",
                String.format("Your review wasn't approved. Reason: %s. " +
                        "This affects your approval rate. Please review our quality guidelines " +
                        "to ensure your future reviews meet our standards.",
                        reason),
                baseUrl + "/reviewers/guidelines"
        );
    }

    private EmailContent generatePayoutPendingEmail(Map<String, Object> context) {
        BigDecimal amount = getBigDecimal(context, "amount", BigDecimal.ZERO);

        return new EmailContent(
                String.format("Payout processing: $%.2f", amount),
                "Payout Being Processed",
                String.format("Your payout request for $%.2f is being processed. " +
                        "Funds will arrive in your account within 3-5 business days.",
                        amount),
                baseUrl + "/reviewers/payouts"
        );
    }

    private EmailContent generatePayoutReleasedEmail(Map<String, Object> context) {
        BigDecimal amount = getBigDecimal(context, "amount", BigDecimal.ZERO);
        String method = getString(context, "method", "your payment method");

        return new EmailContent(
                String.format("Payout complete: $%.2f sent!", amount),
                "Payout Sent!",
                String.format("Your payout of $%.2f has been sent to %s! " +
                        "Check your account for the funds. Thank you for being a valued reviewer!",
                        amount, method),
                baseUrl + "/reviewers/payouts"
        );
    }

    private EmailContent generatePolicyUpdateEmail(Map<String, Object> context) {
        String updateSummary = getString(context, "summary", "We've updated our policies");

        return new EmailContent(
                "Policy update - Please review",
                "Important Policy Update",
                String.format("%s. Please review the changes to ensure continued compliance. " +
                        "Your continued use of the platform indicates acceptance of these updates.",
                        updateSummary),
                baseUrl + "/reviewers/policies"
        );
    }

    private EmailContent generateNewTasksAvailableEmail(Map<String, Object> context) {
        int taskCount = getInt(context, "taskCount", 1);
        String language = getString(context, "language", "your language");

        return new EmailContent(
                taskCount + " new task" + (taskCount > 1 ? "s" : "") + " available!",
                "New Tasks Available",
                String.format("%d new review task%s available in %s. " +
                        "Claim them now before they're taken by other reviewers!",
                        taskCount, taskCount > 1 ? "s are" : " is", language),
                baseUrl + "/reviewers/tasks"
        );
    }

    // --- Helper methods ---

    private String getString(Map<String, Object> context, String key, String defaultValue) {
        Object value = context.get(key);
        return value != null ? value.toString() : defaultValue;
    }

    private int getInt(Map<String, Object> context, String key, int defaultValue) {
        Object value = context.get(key);
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return defaultValue;
    }

    private Long getLong(Map<String, Object> context, String key, Long defaultValue) {
        Object value = context.get(key);
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return defaultValue;
    }

    private BigDecimal getBigDecimal(Map<String, Object> context, String key, BigDecimal defaultValue) {
        Object value = context.get(key);
        if (value instanceof BigDecimal) {
            return (BigDecimal) value;
        } else if (value instanceof Number) {
            return BigDecimal.valueOf(((Number) value).doubleValue());
        }
        return defaultValue;
    }
}
