package com.contentdiagnostics.notifications.entity;

/**
 * Types of notifications.
 */
public enum NotificationType {
    // Common notifications
    WELCOME,
    PASSWORD_RESET,
    EMAIL_VERIFICATION,

    // Creator notifications
    UPLOAD_RECEIVED,
    PROCESSING_UPDATE,
    AI_DIAGNOSTICS_COMPLETE,
    HUMAN_REVIEW_IN_PROGRESS,
    REPORT_READY,
    SUBSCRIPTION_BILLING,
    ADDON_CONFIRMATION,
    LOW_CREDITS,
    SUBSCRIPTION_EXPIRING,

    // Reviewer notifications
    QUALIFICATION_PASSED,
    QUALIFICATION_FAILED,
    TASK_ACCEPTED,
    TASK_SUBMITTED,
    TASK_APPROVED,
    TASK_REJECTED,
    PAYOUT_PENDING,
    PAYOUT_RELEASED,
    POLICY_UPDATE,
    NEW_TASKS_AVAILABLE
}
