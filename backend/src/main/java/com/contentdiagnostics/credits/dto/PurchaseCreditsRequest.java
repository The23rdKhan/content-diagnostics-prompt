package com.contentdiagnostics.credits.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for purchasing credits.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseCreditsRequest {

    @NotBlank(message = "Bundle ID is required")
    private String bundleId;

    private String successUrl;
    private String cancelUrl;
}
