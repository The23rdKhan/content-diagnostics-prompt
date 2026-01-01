package com.contentdiagnostics.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for admin KPI dashboard response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiResponse {

    private Long totalCreators;
    private Long totalReviewers;
    private Long activeReviewers;
    private Long pendingTasks;
    private Long tasksCompletedToday;
    private Long jobsInProgress;
    private Long jobsDeliveredToday;
    private Double avgDeliveryTimeHours;
    private Double slaComplianceRate;
}
