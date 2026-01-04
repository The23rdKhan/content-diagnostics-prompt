package com.contentdiagnostics.notifications.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO for email statistics dashboard.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailStatsDto {

    private long totalSent;
    private long totalFailed;
    private long totalSkipped;
    private long sentToday;
    private long failedToday;
    private double deliveryRate;

    /**
     * Breakdown by notification type.
     * Key: notification type name, Value: count
     */
    private Map<String, Long> byType;

    /**
     * Breakdown by status.
     * Key: status name, Value: count
     */
    private Map<String, Long> byStatus;
}
