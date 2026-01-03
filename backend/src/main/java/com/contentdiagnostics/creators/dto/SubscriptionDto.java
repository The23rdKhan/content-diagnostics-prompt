package com.contentdiagnostics.creators.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * DTO for creator subscription details.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionDto {

    private String planId;
    private String planName;
    private String status;
    private BigDecimal monthlyPrice;
    private String billingPeriod;
    private Instant currentPeriodStart;
    private Instant currentPeriodEnd;
    private Integer remainingCredits;
    private Integer videosThisMonth;
    private Integer videosLimit;
    private Boolean cancelAtPeriodEnd;
    private String stripeCustomerId;
    private String stripeSubscriptionId;
}
