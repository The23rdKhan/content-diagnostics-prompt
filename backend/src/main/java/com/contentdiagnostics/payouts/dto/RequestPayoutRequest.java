package com.contentdiagnostics.payouts.dto;

import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for requesting a payout.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestPayoutRequest {

    /**
     * Optional specific amount to withdraw.
     * If not provided, withdraws all pending earnings.
     */
    @Positive(message = "Amount must be positive")
    private Double amount;
}
