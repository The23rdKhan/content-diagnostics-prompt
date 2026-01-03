package com.contentdiagnostics.jobs.dto;

import com.contentdiagnostics.jobs.entity.JobStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO for job responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDto {

    private Long id;
    private Long videoId;
    private String videoTitle;
    private String fileName;
    private Long fileSize;
    private JobStatus status;
    private String language;
    private Integer slaHours;
    private Integer requiredReviewers;
    private Integer completedReviewers;
    private Integer totalReviewers;

    // Add-ons
    private Integer extraReviewers;
    private Boolean fasterDelivery;
    private Boolean fullWatchSummary;
    private Boolean liveFeedback;

    // Timeline
    private TimelineDto timeline;
    private ProgressDto progress;
    private String slaStatus;
    private Integer deliveryTimeHours;
    private String estimatedDeliveryWindow;

    private Instant createdAt;
    private Instant deliveredAt;

    // Report reference (populated when job is delivered)
    private Long reportId;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimelineDto {
        private String aiDiagnostics; // "pending", "complete"
        private String humanReview; // "pending", "in-progress", "complete"
        private String compilingReport; // "pending", "in-progress", "complete"
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProgressDto {
        private Integer reviewersCompleted;
        private Integer totalReviewers;
    }
}
