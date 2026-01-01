package com.contentdiagnostics.admin.dto;

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

    private String currentSLA;
    private Integer maxReviewersPerVideo;
    private Boolean checkoutEnabled;
    private Boolean liveAddOnEnabled;
}
