package com.contentdiagnostics.billing.webhook;

import com.contentdiagnostics.billing.service.StripeService;
import com.contentdiagnostics.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Webhook controller for Stripe events.
 * Note: This endpoint is public and validates requests via Stripe signature.
 */
@Slf4j
@RestController
@RequestMapping("/webhooks")
@RequiredArgsConstructor
public class StripeWebhookController {

    private final StripeService stripeService;

    /**
     * Handle Stripe webhook events.
     * POST /api/webhooks/stripe
     */
    @PostMapping("/stripe")
    public ResponseEntity<ApiResponse<Void>> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature) {

        log.debug("Received Stripe webhook");

        stripeService.handleWebhook(payload, signature);

        return ResponseEntity.ok(ApiResponse.success("Webhook processed"));
    }
}
