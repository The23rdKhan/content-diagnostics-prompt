package com.contentdiagnostics.reviewers.dto;

import com.contentdiagnostics.reviewers.entity.PayoutMethod;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating payout method.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePayoutMethodRequest {

    @NotNull(message = "Payout method is required")
    private PayoutMethod payoutMethod;

    private String payoutDetails;
}
