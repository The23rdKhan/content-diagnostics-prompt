package com.contentdiagnostics.admin.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating language pool capacity settings.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCapacityRequest {

    /**
     * SLA target. Must be one of: 24h, 48h, 72h
     */
    @Pattern(regexp = "^(24h|48h|72h)$", message = "SLA must be one of: 24h, 48h, 72h")
    private String currentSLA;

    /**
     * Maximum reviewers per video. Must be between 1 and 20.
     */
    @Min(value = 1, message = "Max reviewers must be at least 1")
    @Max(value = 20, message = "Max reviewers cannot exceed 20")
    private Integer maxReviewersPerVideo;

    private Boolean checkoutEnabled;
    private Boolean liveAddOnEnabled;
}
