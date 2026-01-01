package com.contentdiagnostics.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * DTO for admin view of reviewers.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReviewerDto {

    private Long id;
    private String name;
    private String email;
    private String language;
    private String qualificationStatus;
    private Integer qualityScore;
    private Integer completionRate;
    private Integer strikes;
    private String status;
    private Integer tasksCompleted;
    private Double approvalRate;
    private Instant joinedAt;
}
