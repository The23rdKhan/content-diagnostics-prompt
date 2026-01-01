package com.contentdiagnostics.notifications.entity;

/**
 * Types of notifications.
 */
public enum NotificationType {
    // Creator notifications
    UPLOAD_RECEIVED,
    PROCESSING_UPDATE,
    AI_DIAGNOSTICS_COMPLETE,
    HUMAN_REVIEW_IN_PROGRESS,
    REPORT_READY,
    SUBSCRIPTION_BILLING,
    ADDON_CONFIRMATION,

    // Reviewer notifications
    QUALIFICATION_PASSED,
    QUALIFICATION_FAILED,
    TASK_ACCEPTED,
    TASK_SUBMITTED,
    TASK_APPROVED,
    TASK_REJECTED,
    PAYOUT_PENDING,
    PAYOUT_RELEASED,
    POLICY_UPDATE
}
