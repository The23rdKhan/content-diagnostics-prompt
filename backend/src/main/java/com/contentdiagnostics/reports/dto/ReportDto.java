package com.contentdiagnostics.reports.dto;

import com.contentdiagnostics.reports.entity.ReportStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * DTO for report responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportDto {

    private Long id;
    private String videoTitle;
    private String duration;
    private Integer videoDurationMinutes;
    private String languagePool;
    private ReportStatus status;
    private Integer guaranteedReviewers;
    private String slaWindow;
    private String actualDeliveryTime;
    private Instant dateSubmitted;
    private Instant dateCompleted;

    // Completion flags
    private boolean aiComplete;
    private boolean humanComplete;
    private boolean compiled;

    // Scores
    private Integer clarityScore;
    private Integer pacingScore;
    private Integer engagementScore;
    private Integer structureScore;

    // Content
    private String executiveSummary;
    private List<TimelineInsight> timelineInsights;
    private AiAnalysis aiAnalysis;
    private HumanReviews humanReviews;
    private List<ActionItem> actionPlan;

    // Series tracking
    private String seriesId;
    private Integer version;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimelineInsight {
        private String timestamp;
        private String observation;
        private String severity; // "minor", "moderate", "critical"
        private String category; // "hook", "clarity", "pace", "energy", "structure"
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiAnalysis {
        private List<String> monologueStretches;
        private List<String> silenceDowntime;
        private List<String> topicDrift;
        private List<String> energyVariance;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HumanReviews {
        private String engagementStats;
        private List<String> comments;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActionItem {
        private String action;
        private String why;
        private String expectedResult;
    }
}
