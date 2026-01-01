package com.contentdiagnostics.jobs.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for submitting a video for review (creating a job).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitVideoRequest {

    @Min(value = 10, message = "Minimum 10 reviewers required")
    @Max(value = 100, message = "Maximum 100 reviewers allowed")
    private Integer requiredReviewers;

    // Add-ons
    private Integer extraReviewers; // 10 or 25

    private Boolean fasterDelivery;

    private Boolean fullWatchSummary;

    private Boolean liveFeedback;
}
