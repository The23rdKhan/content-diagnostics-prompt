package com.contentdiagnostics.credits.controller;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.billing.dto.CheckoutSessionResponse;
import com.contentdiagnostics.common.exception.BadRequestException;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.common.util.SecurityUtils;
import com.contentdiagnostics.creators.entity.CreatorProfile;
import com.contentdiagnostics.creators.repository.CreatorProfileRepository;
import com.contentdiagnostics.credits.dto.CreditBalanceDto;
import com.contentdiagnostics.credits.dto.CreditBundleDto;
import com.contentdiagnostics.credits.dto.CreditTransactionDto;
import com.contentdiagnostics.credits.dto.PurchaseCreditsRequest;
import com.contentdiagnostics.credits.entity.CreditBundle;
import com.contentdiagnostics.credits.repository.CreditBundleRepository;
import com.contentdiagnostics.credits.service.CreditService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.checkout.Session;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for credit management.
 */
@Slf4j
@RestController
@RequestMapping("/creator/credits")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CREATOR')")
public class CreditController {

    private final CreditService creditService;
    private final CreatorProfileRepository creatorProfileRepository;
    private final CreditBundleRepository creditBundleRepository;

    @Value("${stripe.secret-key:}")
    private String stripeSecretKey;

    /**
     * Get current credit balance.
     */
    @GetMapping("/balance")
    public ResponseEntity<CreditBalanceDto> getBalance() {
        User user = SecurityUtils.getCurrentUser();
        CreditBalanceDto balance = creditService.getCreditBalance(user);
        return ResponseEntity.ok(balance);
    }

    /**
     * Get available credit bundles for purchase.
     */
    @GetMapping("/bundles")
    public ResponseEntity<List<CreditBundleDto>> getBundles() {
        List<CreditBundleDto> bundles = creditService.getAvailableBundles();
        return ResponseEntity.ok(bundles);
    }

    /**
     * Get credit transaction history.
     */
    @GetMapping("/transactions")
    public ResponseEntity<Page<CreditTransactionDto>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User user = SecurityUtils.getCurrentUser();
        // Prevent memory exhaustion by limiting page size
        int safeSize = Math.min(Math.max(size, 1), 100);
        Page<CreditTransactionDto> transactions = creditService.getTransactionHistory(user, page, safeSize);
        return ResponseEntity.ok(transactions);
    }

    private static final List<String> ALLOWED_REDIRECT_HOSTS = List.of(
            "localhost",
            "127.0.0.1",
            "contentdiagnostics.com",
            "www.contentdiagnostics.com"
    );

    /**
     * Validate that a URL is safe for redirect (only allowed hosts).
     */
    private String validateRedirectUrl(String url, String defaultUrl) {
        if (url == null || url.isEmpty()) {
            return defaultUrl;
        }
        try {
            java.net.URI uri = new java.net.URI(url);
            String host = uri.getHost();
            if (host != null && ALLOWED_REDIRECT_HOSTS.stream().anyMatch(h -> host.equalsIgnoreCase(h) || host.endsWith("." + h))) {
                return url;
            }
        } catch (Exception e) {
            log.warn("Invalid redirect URL provided: {}", url);
        }
        return defaultUrl;
    }

    /**
     * Create a checkout session for purchasing credits.
     */
    @PostMapping("/purchase")
    public ResponseEntity<CheckoutSessionResponse> purchaseCredits(
            @Valid @RequestBody PurchaseCreditsRequest request) {
        User user = SecurityUtils.getCurrentUser();

        CreditBundle bundle = creditBundleRepository.findByBundleCode(request.getBundleId())
                .orElseThrow(() -> new BadRequestException("Invalid bundle ID: " + request.getBundleId()));

        CreatorProfile profile = creatorProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Creator profile", user.getId().toString()));

        // Check if Stripe is configured
        boolean stripeConfigured = stripeSecretKey != null && !stripeSecretKey.isEmpty()
                && !stripeSecretKey.contains("placeholder") && stripeSecretKey.startsWith("sk_");

        String defaultSuccessUrl = "http://localhost:3000/creators/dashboard?credits_purchased=true";
        String defaultCancelUrl = "http://localhost:3000/creators/dashboard";

        if (!stripeConfigured) {
            // Dev mode: return mock session that simulates success
            log.warn("Stripe not configured - returning mock credit purchase session for user {} (DEV MODE ONLY)", user.getId());
            String successUrl = validateRedirectUrl(request.getSuccessUrl(), defaultSuccessUrl);

            // In dev mode, auto-add credits
            creditService.addPurchasedCredits(profile, bundle.getBundleCode(), "mock_" + System.currentTimeMillis(), bundle.getPrice());

            return ResponseEntity.ok(CheckoutSessionResponse.builder()
                    .sessionId("mock_credit_session_" + System.currentTimeMillis())
                    .url(successUrl + (successUrl.contains("?") ? "&" : "?") + "credits_purchased=" + bundle.getCredits())
                    .build());
        }

        try {
            Stripe.apiKey = stripeSecretKey;

            // Get or create Stripe customer
            String customerId = getOrCreateCustomer(user, profile);

            // Validate redirect URLs to prevent open redirect attacks
            String successUrl = validateRedirectUrl(request.getSuccessUrl(), defaultSuccessUrl);
            String cancelUrl = validateRedirectUrl(request.getCancelUrl(), defaultCancelUrl);

            // Create one-time payment session for credits
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setCustomer(customerId)
                    .setSuccessUrl(successUrl)
                    .setCancelUrl(cancelUrl)
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency("usd")
                                    .setUnitAmount(bundle.getPrice().multiply(new java.math.BigDecimal("100")).longValue())
                                    .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                            .setName(bundle.getName())
                                            .setDescription(bundle.getCredits() + " credits - " + bundle.getDescription())
                                            .build())
                                    .build())
                            .build())
                    .putMetadata("user_id", user.getId().toString())
                    .putMetadata("bundle_id", bundle.getBundleCode())
                    .putMetadata("credits", String.valueOf(bundle.getCredits()))
                    .putMetadata("purchase_type", "credits")
                    .build();

            Session session = Session.create(params);

            log.info("Created credit purchase checkout session {} for user {}, bundle {}",
                    session.getId(), user.getId(), bundle.getBundleCode());

            return ResponseEntity.ok(CheckoutSessionResponse.builder()
                    .sessionId(session.getId())
                    .url(session.getUrl())
                    .build());

        } catch (StripeException e) {
            log.error("Stripe error creating credit purchase session", e);
            throw new BadRequestException("Failed to create checkout session: " + e.getMessage());
        }
    }

    private String getOrCreateCustomer(User user, CreatorProfile profile) throws StripeException {
        if (profile.getStripeCustomerId() != null) {
            return profile.getStripeCustomerId();
        }

        CustomerCreateParams params = CustomerCreateParams.builder()
                .setEmail(user.getEmail())
                .setName(profile.getName())
                .putMetadata("user_id", user.getId().toString())
                .build();

        Customer customer = Customer.create(params);
        profile.setStripeCustomerId(customer.getId());
        creatorProfileRepository.save(profile);

        log.info("Created Stripe customer {} for user {}", customer.getId(), user.getId());

        return customer.getId();
    }
}
