package com.contentdiagnostics.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for report comparison.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportComparisonResponse {

    private ReportDto leftReport;
    private ReportDto rightReport;
    private ScoreComparison scoreComparison;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoreComparison {
        private Integer clarityDelta;
        private Integer pacingDelta;
        private Integer engagementDelta;
        private Integer structureDelta;
        private String overallTrend; // "improved", "declined", "stable"
    }
}
