package com.contentdiagnostics.reviewers.dto;

import com.contentdiagnostics.reviewers.entity.PayoutMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO for reviewer profile responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewerProfileDto {

    private Long id;
    private String firstName;
    private String lastName;
    private String displayName;
    private String email;
    private String profileImageUrl;
    private String language;
    private String proficiency;
    private boolean qualificationPassed;
    private Integer qualityScore;
    private boolean queueLocked;
    private Integer tasksCompleted;
    private Integer tasksApproved;
    private Integer tasksRejected;
    private Double approvalRate;
    private Double totalEarnings;
    private Double pendingEarnings;
    private PayoutMethod payoutMethod;
    private Integer strikes;
    private Instant createdAt;
}
