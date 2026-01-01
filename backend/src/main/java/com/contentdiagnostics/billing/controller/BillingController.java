package com.contentdiagnostics.billing.controller;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.billing.dto.CheckoutSessionRequest;
import com.contentdiagnostics.billing.dto.CheckoutSessionResponse;
import com.contentdiagnostics.billing.dto.PortalSessionResponse;
import com.contentdiagnostics.billing.service.StripeService;
import com.contentdiagnostics.common.dto.ApiResponse;
import com.contentdiagnostics.common.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for billing endpoints.
 */
@Slf4j
@RestController
@RequestMapping("/billing")
@RequiredArgsConstructor
public class BillingController {

    private final StripeService stripeService;

    /**
     * Create a Stripe checkout session.
     * POST /api/billing/stripe/checkout-session
     */
    @PostMapping("/stripe/checkout-session")
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<ApiResponse<CheckoutSessionResponse>> createCheckoutSession(
            @Valid @RequestBody CheckoutSessionRequest request) {

        User user = SecurityUtils.getCurrentUser();
        CheckoutSessionResponse response = stripeService.createCheckoutSession(user, request);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Create a Stripe customer portal session.
     * POST /api/billing/stripe/portal-session
     */
    @PostMapping("/stripe/portal-session")
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<ApiResponse<PortalSessionResponse>> createPortalSession(
            @RequestParam(required = false) String returnUrl) {

        User user = SecurityUtils.getCurrentUser();
        PortalSessionResponse response = stripeService.createPortalSession(user, returnUrl);

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
