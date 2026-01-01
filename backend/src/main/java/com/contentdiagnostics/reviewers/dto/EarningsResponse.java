package com.contentdiagnostics.reviewers.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for reviewer earnings response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EarningsResponse {

    private Double totalEarnings;
    private Double pendingEarnings;
    private Double availableForPayout;
    private Integer tasksCompletedThisMonth;
    private Double earningsThisMonth;
    private List<EarningsBreakdown> recentEarnings;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EarningsBreakdown {
        private String date;
        private Integer tasksCompleted;
        private Double amount;
    }
}
