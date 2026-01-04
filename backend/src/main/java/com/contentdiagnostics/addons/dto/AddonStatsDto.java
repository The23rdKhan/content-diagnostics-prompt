package com.contentdiagnostics.addons.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for addon usage statistics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddonStatsDto {
    private long catalogCount;
    private long activeCatalogCount;
    private long totalApplied;
    private long activeApplied;
    private long completedApplied;
    private long refundedApplied;
}
