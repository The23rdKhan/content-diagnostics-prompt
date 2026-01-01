package com.contentdiagnostics.admin.dto;

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
}
