package com.contentdiagnostics.jobs.entity;

/**
 * Status of a review job in the pipeline.
 */
public enum JobStatus {
    /**
     * Video is uploading.
     */
    UPLOADING,

    /**
     * Video uploaded, awaiting processing.
     */
    UPLOADED,

    /**
     * Video being processed (AI analysis, segmentation).
     */
    PROCESSING,

    /**
     * Video segmented, tasks created, awaiting human review.
     */
    SEGMENTED,

    /**
     * Human reviewers are actively completing tasks.
     */
    IN_REVIEW,

    /**
     * All reviews complete, report being compiled.
     */
    COMPILING,

    /**
     * Report delivered to creator.
     */
    DELIVERED,

    /**
     * Job cancelled.
     */
    CANCELLED,

    /**
     * Job failed.
     */
    FAILED
}
