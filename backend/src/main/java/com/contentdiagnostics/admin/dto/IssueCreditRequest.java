package com.contentdiagnostics.admin.dto;

import com.contentdiagnostics.credits.entity.CreditTransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for issuing credits to a creator.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueCreditRequest {

    @NotNull(message = "Credits amount is required")
    @Min(value = 1, message = "Credits must be positive")
    private Integer credits;

    private String reason;

    /**
     * Type of credit transaction. Defaults to ADMIN_ISSUE if not specified.
     * Allowed values: ADMIN_ISSUE, PROMO
     */
    private CreditTransactionType type;
}
