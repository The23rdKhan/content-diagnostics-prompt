package com.contentdiagnostics.billing.service;

import com.contentdiagnostics.addons.entity.AppliedAddon;
import com.contentdiagnostics.addons.repository.AppliedAddonRepository;
import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.billing.dto.BillingSummaryDto;
import com.contentdiagnostics.billing.dto.InvoiceDto;
import com.contentdiagnostics.billing.dto.PaymentMethodDto;
import com.contentdiagnostics.billing.entity.Invoice;
import com.contentdiagnostics.billing.repository.InvoiceRepository;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
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

    /**
     * Get billing summary for a user.
     */
    @Transactional(readOnly = true)
    public BillingSummaryDto getBillingSummary(User user) {
        // Calculate add-ons this month
        BigDecimal addonsThisMonth = appliedAddonRepository.findByCreatorOrderByAppliedAtDesc(user).stream()
                .filter(addon -> addon.getAppliedAt().isAfter(Instant.now().minus(30, ChronoUnit.DAYS)))
                .map(AppliedAddon::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Get current plan cost from subscription (simplified for now)
        BigDecimal currentPlanCost = new BigDecimal("149.00"); // Default to Pro plan

        // Calculate next invoice
        BigDecimal nextInvoiceAmount = currentPlanCost.add(addonsThisMonth);
        Instant nextInvoiceDate = Instant.now().plus(30, ChronoUnit.DAYS);

        return BillingSummaryDto.builder()
                .currentPlanCost(currentPlanCost)
                .addonsThisMonth(addonsThisMonth)
                .nextInvoiceAmount(nextInvoiceAmount)
                .nextInvoiceDate(nextInvoiceDate)
                .currency("USD")
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
