package com.contentdiagnostics.reviewers.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * Response containing qualification test questions and status.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QualificationTestResponse {

    /**
     * Whether the user is eligible to take the test.
     */
    private boolean eligible;

    /**
     * Message explaining eligibility status.
     */
    private String message;

    /**
     * Number of attempts remaining.
     */
    private int attemptsRemaining;

    /**
     * If not eligible due to cooldown, when they can retry.
     */
    private Instant canRetryAt;

    /**
     * Minimum time in seconds to complete the test.
     */
    private int minCompletionTimeSeconds;

    /**
     * Passing threshold (0.0 to 1.0).
     */
    private double passingThreshold;

    /**
     * The test questions.
     */
    private List<Question> questions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Question {
        private String id;
        private String text;
        private List<String> options;
    }
}
