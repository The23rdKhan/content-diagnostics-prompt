package com.contentdiagnostics.payouts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO for payout responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayoutDto {

    private Long id;
    private Long reviewerId;
    private String reviewerName;
    private Double amount;
    private Integer tasksIncluded;
    private String status;
    private Instant createdAt;
    private Instant releasedAt;
}
