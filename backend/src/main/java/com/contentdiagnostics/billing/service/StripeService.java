package com.contentdiagnostics.billing.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.billing.dto.CheckoutSessionRequest;
import com.contentdiagnostics.billing.dto.CheckoutSessionResponse;
import com.contentdiagnostics.billing.dto.PortalSessionResponse;
import com.contentdiagnostics.billing.entity.StripeEvent;
import com.contentdiagnostics.billing.repository.StripeEventRepository;
import com.contentdiagnostics.common.exception.BadRequestException;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.creators.entity.CreatorProfile;
import com.contentdiagnostics.creators.repository.CreatorProfileRepository;
import com.contentdiagnostics.credits.entity.CreditBundle;
import com.contentdiagnostics.credits.repository.CreditBundleRepository;
import com.contentdiagnostics.credits.service.CreditService;
import com.contentdiagnostics.notifications.entity.NotificationType;
import com.contentdiagnostics.notifications.service.NotificationService;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

/**
 * Service for Stripe payment operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StripeService {

    private final StripeEventRepository stripeEventRepository;
    private final CreatorProfileRepository creatorProfileRepository;
    private final CreditBundleRepository creditBundleRepository;
    private final CreditService creditService;
    private final NotificationService notificationService;

    @Value("${stripe.secret-key:}")
    private String stripeSecretKey;

    @Value("${stripe.webhook-secret:}")
    private String webhookSecret;

    @Value("${stripe.price-ids.basic:}")
    private String basicPriceId;

    @Value("${stripe.price-ids.professional:}")
    private String professionalPriceId;

    @Value("${stripe.price-ids.enterprise:}")
    private String enterprisePriceId;

    private boolean stripeConfigured = false;

    @PostConstruct
    public void init() {
        if (isValidStripeKey(stripeSecretKey)) {
            Stripe.apiKey = stripeSecretKey;
            stripeConfigured = true;
            log.info("Stripe configured successfully");
        } else {
            log.warn("Stripe not configured - billing features disabled. Set STRIPE_SECRET_KEY to enable.");
        }
    }

    private boolean isValidStripeKey(String key) {
        return key != null && !key.isEmpty() && !key.contains("placeholder") && key.startsWith("sk_");
    }

    public boolean isStripeConfigured() {
        return stripeConfigured;
    }

    /**
     * Create a checkout session for subscription.
     * Returns mock data when Stripe is not configured (development mode).
     */
    public CheckoutSessionResponse createCheckoutSession(User user, CheckoutSessionRequest request) {
        CreatorProfile profile = creatorProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Creator profile", user.getId().toString()));

        // Return mock checkout session when Stripe is not configured (dev mode)
        if (!stripeConfigured) {
            log.info("Stripe not configured - returning mock checkout session for user {}", user.getId());

            String successUrl = request.getSuccessUrl() != null
                    ? request.getSuccessUrl()
                    : "http://localhost:3000/creators/subscription?success=true";

            // In dev mode, redirect directly to success URL to simulate successful payment
            return CheckoutSessionResponse.builder()
                    .sessionId("mock_session_" + System.currentTimeMillis())
                    .url(successUrl + "?session_id=mock_session_" + System.currentTimeMillis())
                    .build();
        }

        String priceId = getPriceId(request.getPlanTier());
        if (priceId == null || priceId.isEmpty()) {
            throw new BadRequestException("Invalid plan tier or price not configured");
        }

        try {
            // Get or create Stripe customer
            String customerId = getOrCreateCustomer(user, profile);

            String successUrl = request.getSuccessUrl() != null
                    ? request.getSuccessUrl()
                    : "http://localhost:3000/creators/subscription?success=true";
            String cancelUrl = request.getCancelUrl() != null
                    ? request.getCancelUrl()
                    : "http://localhost:3000/creators/subscription?canceled=true";

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                    .setCustomer(customerId)
                    .setSuccessUrl(successUrl)
                    .setCancelUrl(cancelUrl)
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setPrice(priceId)
                            .setQuantity(1L)
                            .build())
                    .putMetadata("user_id", user.getId().toString())
                    .putMetadata("plan_tier", request.getPlanTier())
                    .build();

            Session session = Session.create(params);

            log.info("Created checkout session {} for user {}", session.getId(), user.getId());

            return CheckoutSessionResponse.builder()
                    .sessionId(session.getId())
                    .url(session.getUrl())
                    .build();

        } catch (StripeException e) {
            log.error("Stripe error creating checkout session", e);
            throw new BadRequestException("Failed to create checkout session: " + e.getMessage());
        }
    }

    /**
     * Create a customer portal session.
     * Returns mock redirect when Stripe is not configured (development mode).
     */
    public PortalSessionResponse createPortalSession(User user, String returnUrl) {
        CreatorProfile profile = creatorProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Creator profile", user.getId().toString()));

        String url = returnUrl != null ? returnUrl : "http://localhost:3000/creators/subscription";

        // Return mock portal session when Stripe is not configured (dev mode)
        if (!stripeConfigured) {
            log.info("Stripe not configured - returning mock portal session for user {}", user.getId());
            return PortalSessionResponse.builder()
                    .url(url + "?portal=mock")
                    .build();
        }

        if (profile.getStripeCustomerId() == null) {
            throw new BadRequestException("No subscription found");
        }

        try {
            com.stripe.param.billingportal.SessionCreateParams params =
                    com.stripe.param.billingportal.SessionCreateParams.builder()
                    .setCustomer(profile.getStripeCustomerId())
                    .setReturnUrl(url)
                    .build();

            com.stripe.model.billingportal.Session session =
                    com.stripe.model.billingportal.Session.create(params);

            return PortalSessionResponse.builder()
                    .url(session.getUrl())
                    .build();

        } catch (StripeException e) {
            log.error("Stripe error creating portal session", e);
            throw new BadRequestException("Failed to create portal session: " + e.getMessage());
        }
    }

    /**
     * Handle Stripe webhook event.
     */
    @Transactional
    public void handleWebhook(String payload, String signature) {
        if (!stripeConfigured) {
            log.warn("Stripe webhook received but Stripe is not configured");
            throw new BadRequestException("Stripe is not configured");
        }

        Event event;
        try {
            event = Webhook.constructEvent(payload, signature, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Invalid Stripe webhook signature", e);
            throw new BadRequestException("Invalid webhook signature");
        }

        String eventId = event.getId();

        // Idempotency check
        if (stripeEventRepository.existsByEventId(eventId)) {
            log.info("Stripe event {} already processed, skipping", eventId);
            return;
        }

        // Store event for idempotency
        StripeEvent stripeEvent = StripeEvent.builder()
                .eventId(eventId)
                .eventType(event.getType())
                .payload(payload)
                .processed(false)
                .build();
        stripeEventRepository.save(stripeEvent);

        try {
            processEvent(event);
            stripeEvent.setProcessed(true);
            stripeEvent.setProcessedAt(Instant.now());
        } catch (Exception e) {
            log.error("Error processing Stripe event {}", eventId, e);
            stripeEvent.setProcessingError(e.getMessage());
        }

        stripeEventRepository.save(stripeEvent);
    }

    // --- Private methods ---

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

    private String getPriceId(String planTier) {
        return switch (planTier.toLowerCase()) {
            case "basic" -> basicPriceId;
            case "professional" -> professionalPriceId;
            case "enterprise" -> enterprisePriceId;
            default -> null;
        };
    }

    private void processEvent(Event event) {
        String type = event.getType();
        log.info("Processing Stripe event: {}", type);

        switch (type) {
            case "checkout.session.completed" -> handleCheckoutCompleted(event);
            case "customer.subscription.updated" -> handleSubscriptionUpdated(event);
            case "customer.subscription.deleted" -> handleSubscriptionDeleted(event);
            case "invoice.payment_succeeded" -> handlePaymentSucceeded(event);
            case "invoice.payment_failed" -> handlePaymentFailed(event);
            default -> log.debug("Unhandled event type: {}", type);
        }
    }

    private void handleCheckoutCompleted(Event event) {
        Session session = (Session) event.getDataObjectDeserializer()
                .getObject().orElse(null);

        if (session == null) return;

        String customerId = session.getCustomer();
        Map<String, String> metadata = session.getMetadata();

        // Check if this is a credit purchase
        String purchaseType = metadata.get("purchase_type");
        if ("credits".equals(purchaseType)) {
            handleCreditPurchase(session, customerId, metadata);
            return;
        }

        // Handle subscription checkout
        String subscriptionId = session.getSubscription();
        String planTier = metadata.get("plan_tier");

        creatorProfileRepository.findByStripeCustomerId(customerId).ifPresent(profile -> {
            profile.setStripeSubscriptionId(subscriptionId);
            profile.setPlanTier(planTier);
            creatorProfileRepository.save(profile);
            log.info("Updated subscription for profile {}: {}", profile.getId(), planTier);
        });
    }

    private void handleCreditPurchase(Session session, String customerId, Map<String, String> metadata) {
        String bundleId = metadata.get("bundle_id");
        String paymentIntentId = session.getPaymentIntent();

        if (paymentIntentId == null || paymentIntentId.isEmpty()) {
            log.error("Credit purchase webhook missing payment intent ID for session {}", session.getId());
            return;
        }

        // Idempotency check - ensure we don't process the same payment twice
        if (creditService.isPaymentAlreadyProcessed(paymentIntentId)) {
            log.info("Credit purchase for payment {} already processed, skipping", paymentIntentId);
            return;
        }

        creatorProfileRepository.findByStripeCustomerId(customerId).ifPresentOrElse(
            profile -> {
                CreditBundle bundle = creditBundleRepository.findByBundleCode(bundleId)
                        .orElse(null);
                if (bundle != null) {
                    creditService.addPurchasedCredits(profile, bundleId, paymentIntentId, bundle.getPrice());
                    log.info("Added {} credits from bundle {} for profile {}",
                            bundle.getCredits(), bundleId, profile.getId());
                } else {
                    log.error("Unknown bundle ID {} in credit purchase webhook", bundleId);
                    throw new RuntimeException("Unknown bundle ID: " + bundleId);
                }
            },
            () -> {
                log.error("No profile found for Stripe customer {} in credit purchase webhook", customerId);
                throw new RuntimeException("Profile not found for customer: " + customerId);
            }
        );
    }

    private void handleSubscriptionUpdated(Event event) {
        Subscription subscription = (Subscription) event.getDataObjectDeserializer()
                .getObject().orElse(null);

        if (subscription == null) return;

        String customerId = subscription.getCustomer();
        String status = subscription.getStatus();

        log.info("Subscription {} updated: status={}", subscription.getId(), status);

        // Update profile based on subscription status
        creatorProfileRepository.findByStripeCustomerId(customerId).ifPresent(profile -> {
            // Handle subscription status changes
            if ("canceled".equals(status) || "unpaid".equals(status)) {
                profile.setPlanTier("basic");
                profile.setStripeSubscriptionId(null);
            }
            creatorProfileRepository.save(profile);
        });
    }

    private void handleSubscriptionDeleted(Event event) {
        Subscription subscription = (Subscription) event.getDataObjectDeserializer()
                .getObject().orElse(null);

        if (subscription == null) return;

        String customerId = subscription.getCustomer();

        creatorProfileRepository.findByStripeCustomerId(customerId).ifPresent(profile -> {
            profile.setPlanTier("basic");
            profile.setStripeSubscriptionId(null);
            creatorProfileRepository.save(profile);
            log.info("Subscription cancelled for profile {}", profile.getId());
        });
    }

    private void handlePaymentSucceeded(Event event) {
        Invoice invoice = (Invoice) event.getDataObjectDeserializer()
                .getObject().orElse(null);

        if (invoice == null) return;

        log.info("Payment succeeded for invoice {}", invoice.getId());

        // Create notification for user
        String customerId = invoice.getCustomer();
        creatorProfileRepository.findByStripeCustomerId(customerId).ifPresent(profile -> {
            String planTier = profile.getPlanTier() != null ? profile.getPlanTier() : "basic";
            String referenceId = invoice.getId();
            if (!creditService.isExternalTransactionProcessed(referenceId)) {
                creditService.addSubscriptionCredits(profile, planTier, referenceId);
            }
            notificationService.createNotification(
                    profile.getUser(),
                    NotificationType.SUBSCRIPTION_BILLING,
                    "Payment Successful",
                    "Your payment of " + formatAmount(invoice.getAmountPaid()) + " was processed successfully.",
                    "/creators/billing"
            );
        });
    }

    private void handlePaymentFailed(Event event) {
        Invoice invoice = (Invoice) event.getDataObjectDeserializer()
                .getObject().orElse(null);

        if (invoice == null) return;

        log.warn("Payment failed for invoice {}", invoice.getId());

        // Create notification for user
        String customerId = invoice.getCustomer();
        creatorProfileRepository.findByStripeCustomerId(customerId).ifPresent(profile -> {
            notificationService.createNotification(
                    profile.getUser(),
                    NotificationType.SUBSCRIPTION_BILLING,
                    "Payment Failed",
                    "Your payment of " + formatAmount(invoice.getAmountDue()) + " failed. Please update your payment method.",
                    "/creators/billing"
            );
            log.info("Created payment failure notification for user {}", profile.getUser().getId());
        });
    }

    private String formatAmount(Long amountInCents) {
        if (amountInCents == null) return "$0.00";
        double amount = amountInCents / 100.0;
        return String.format("$%.2f", amount);
    }
}
