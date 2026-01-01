package com.contentdiagnostics.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for capacity management response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CapacityResponse {

    private List<LanguagePoolCapacity> languagePools;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LanguagePoolCapacity {
        private String id;
        private String name;
        private String code;
        private Integer capacityScore;
        private String currentSLA;
        private Integer maxReviewersPerVideo;
        private Boolean checkoutEnabled;
        private Boolean liveAddOnEnabled;
        private Long activeReviewers;
        private Long pendingTasks;
        private String avgDeliveryTime;
    }
}
