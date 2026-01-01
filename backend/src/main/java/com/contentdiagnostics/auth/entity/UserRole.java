package com.contentdiagnostics.auth.entity;

/**
 * User roles in the Content Diagnostics platform.
 */
public enum UserRole {
    /**
     * Content creator who uploads videos for review.
     */
    CREATOR,

    /**
     * Reviewer who completes feedback tasks on video segments.
     */
    REVIEWER,

    /**
     * Administrator with full system access.
     */
    ADMIN
}
