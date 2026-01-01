package com.contentdiagnostics.reports.entity;

/**
 * Status of a diagnostic report.
 */
public enum ReportStatus {
    /**
     * Report is being compiled from task submissions.
     */
    COMPILING,

    /**
     * AI analysis complete, awaiting human reviews.
     */
    AWAITING_HUMAN,

    /**
     * Human reviews in progress.
     */
    IN_PROGRESS,

    /**
     * Report delivered to creator.
     */
    DELIVERED
}
