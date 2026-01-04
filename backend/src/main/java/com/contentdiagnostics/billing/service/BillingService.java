package com.contentdiagnostics.billing.service;

import com.contentdiagnostics.addons.repository.AppliedAddonRepository;
import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.billing.dto.BillingSummaryDto;
import com.contentdiagnostics.billing.dto.InvoiceDto;
import com.contentdiagnostics.billing.dto.PaymentMethodDto;
import com.contentdiagnostics.billing.entity.Invoice;
import com.contentdiagnostics.billing.repository.InvoiceRepository;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.creators.entity.CreatorProfile;
import com.contentdiagnostics.creators.repository.CreatorProfileRepository;
import com.contentdiagnostics.plans.service.PlanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillingService {

    private final InvoiceRepository invoiceRepository;
    private final AppliedAddonRepository appliedAddonRepository;
    private final CreatorProfileRepository creatorProfileRepository;
    private final PlanService planService;

    /**
     * Get billing summary for a user.
     */
    @Transactional(readOnly = true)
    public BillingSummaryDto getBillingSummary(User user) {
        // Get creator's current plan
        CreatorProfile profile = creatorProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("CreatorProfile", user.getId().toString()));

        String planTier = profile.getPlanTier() != null ? profile.getPlanTier() : "basic";
        BigDecimal currentPlanCost;
        try {
            currentPlanCost = planService.getPlanPrice(planTier);
        } catch (ResourceNotFoundException e) {
            // Fallback to basic plan if the plan tier is not found in database
            log.warn("Plan tier '{}' not found, falling back to 'basic'", planTier);
            planTier = "basic";
            currentPlanCost = planService.getPlanPrice(planTier);
        }

        // Calculate billing period (30 days from now going back)
        Instant billingPeriodEnd = Instant.now();
        Instant billingPeriodStart = billingPeriodEnd.minus(30, ChronoUnit.DAYS);

        // Calculate add-ons this billing period using efficient DB query (includes quantity)
        BigDecimal addonsThisMonth = appliedAddonRepository.calculateTotalSpend(
                user, billingPeriodStart, billingPeriodEnd);

        // Calculate next invoice
        BigDecimal nextInvoiceAmount = currentPlanCost.add(addonsThisMonth);
        Instant nextInvoiceDate = Instant.now().plus(30, ChronoUnit.DAYS);

        return BillingSummaryDto.builder()
                .currentPlanCost(currentPlanCost)
                .addonsThisMonth(addonsThisMonth)
                .nextInvoiceAmount(nextInvoiceAmount)
                .nextInvoiceDate(nextInvoiceDate)
                .currency("USD")
                .planTier(planTier)
                .build();
    }

    /**
     * Get payment method for a user.
     * In production, this would fetch from Stripe.
     */
    @Transactional(readOnly = true)
    public PaymentMethodDto getPaymentMethod(User user) {
        // In production, fetch from Stripe using stripeCustomerId
        // For now, return a placeholder if user has payment method configured
        return PaymentMethodDto.builder()
                .id("pm_placeholder")
                .type("CARD")
                .lastFour("4242")
                .expiryMonth(12)
                .expiryYear(2025)
                .brand("Visa")
                .build();
    }

    /**
     * Get paginated invoices for a user.
     */
    @Transactional(readOnly = true)
    public Page<InvoiceDto> getInvoices(User user, int page, int size) {
        Page<Invoice> invoices = invoiceRepository.findByUserOrderByCreatedAtDesc(
                user, PageRequest.of(page, size));
        return invoices.map(InvoiceDto::fromEntity);
    }

    /**
     * Get invoice by ID.
     */
    @Transactional(readOnly = true)
    public Invoice getInvoice(User user, Long invoiceId) {
        return invoiceRepository.findByIdAndUser(invoiceId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", invoiceId.toString()));
    }

    /**
     * Create a Stripe portal session URL for updating payment method.
     * In production, this calls Stripe API.
     */
    public String createPaymentMethodUpdateSession(User user, String returnUrl) {
        // In production, use StripeService to create portal session
        // For now, return placeholder
        log.info("Creating payment method update session for user {}", user.getId());
        return returnUrl != null ? returnUrl : "/creators/billing";
    }
}
