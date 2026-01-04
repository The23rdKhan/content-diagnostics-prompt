package com.contentdiagnostics.billing.controller;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.billing.dto.BillingSummaryDto;
import com.contentdiagnostics.billing.dto.InvoiceDto;
import com.contentdiagnostics.billing.dto.PaymentMethodDto;
import com.contentdiagnostics.billing.entity.Invoice;
import com.contentdiagnostics.billing.service.BillingService;
import com.contentdiagnostics.billing.service.InvoicePdfService;
import com.contentdiagnostics.common.dto.ApiResponse;
import com.contentdiagnostics.common.dto.PagedResponse;
import com.contentdiagnostics.common.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for creator billing endpoints.
 */
@Slf4j
@RestController
@RequestMapping("/creator/billing")
@PreAuthorize("hasRole('CREATOR')")
@RequiredArgsConstructor
public class CreatorBillingController {

    private final BillingService billingService;
    private final InvoicePdfService invoicePdfService;

    /**
     * Get billing summary.
     * GET /api/creator/billing/summary
     */
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<BillingSummaryDto>> getBillingSummary() {
        User user = SecurityUtils.getCurrentUser();
        BillingSummaryDto summary = billingService.getBillingSummary(user);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    /**
     * Get payment method.
     * GET /api/creator/billing/payment-method
     */
    @GetMapping("/payment-method")
    public ResponseEntity<ApiResponse<PaymentMethodDto>> getPaymentMethod() {
        User user = SecurityUtils.getCurrentUser();
        PaymentMethodDto paymentMethod = billingService.getPaymentMethod(user);
        return ResponseEntity.ok(ApiResponse.success(paymentMethod));
    }

    /**
     * Get paginated invoices.
     * GET /api/creator/billing/invoices
     */
    @GetMapping("/invoices")
    public ResponseEntity<ApiResponse<PagedResponse<InvoiceDto>>> getInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        User user = SecurityUtils.getCurrentUser();
        Page<InvoiceDto> invoices = billingService.getInvoices(user, page, size);

        PagedResponse<InvoiceDto> response = PagedResponse.<InvoiceDto>builder()
                .content(invoices.getContent())
                .page(invoices.getNumber())
                .size(invoices.getSize())
                .totalElements(invoices.getTotalElements())
                .totalPages(invoices.getTotalPages())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Download invoice PDF.
     * GET /api/creator/billing/invoices/{invoiceId}/download
     */
    @GetMapping("/invoices/{invoiceId}/download")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long invoiceId) {
        User user = SecurityUtils.getCurrentUser();
        Invoice invoice = billingService.getInvoice(user, invoiceId);

        // Generate PDF using the invoice service
        byte[] pdfBytes = invoicePdfService.generateInvoicePdf(
                invoice,
                user.getEmail(),
                user.getEmail()
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"invoice-" + invoice.getInvoiceNumber() + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    /**
     * Create payment method update session (Stripe redirect).
     * POST /api/creator/billing/payment-method/update-session
     */
    @PostMapping("/payment-method/update-session")
    public ResponseEntity<ApiResponse<Map<String, String>>> createUpdateSession(
            @RequestParam(required = false) String returnUrl) {

        User user = SecurityUtils.getCurrentUser();
        String url = billingService.createPaymentMethodUpdateSession(user, returnUrl);

        return ResponseEntity.ok(ApiResponse.success(Map.of("url", url)));
    }
}
