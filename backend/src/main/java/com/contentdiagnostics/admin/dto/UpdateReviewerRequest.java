package com.contentdiagnostics.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating a reviewer (admin action).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReviewerRequest {

    private String status; // "active", "warned", "disabled"
    private Integer strikes;
    private Integer qualityScore;
    private Boolean queueLocked;
}
