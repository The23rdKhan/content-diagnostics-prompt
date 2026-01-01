package com.contentdiagnostics.tasks.entity;

/**
 * Status of a review task.
 */
public enum TaskStatus {
    /**
     * Task available for pickup by reviewers.
     */
    AVAILABLE,

    /**
     * Task leased to a reviewer (10-minute lease).
     */
    LEASED,

    /**
     * Reviewer is actively working on the task.
     */
    IN_PROGRESS,

    /**
     * Task submitted by reviewer, awaiting QC.
     */
    SUBMITTED,

    /**
     * Task in QC review.
     */
    QC_PENDING,

    /**
     * Task approved by QC.
     */
    APPROVED,

    /**
     * Task rejected by QC.
     */
    REJECTED,

    /**
     * Task requeued after rejection or expired lease.
     */
    REQUEUED
}
