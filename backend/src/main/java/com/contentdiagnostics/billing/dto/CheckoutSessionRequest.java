package com.contentdiagnostics.billing.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating a Stripe checkout session.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutSessionRequest {

    @NotBlank(message = "Plan tier is required")
    private String planTier; // "basic", "professional", "enterprise"

    private String successUrl;

    private String cancelUrl;
}
