package com.contentdiagnostics.billing.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when invoice PDF generation fails.
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class InvoicePdfGenerationException extends RuntimeException {

    private final String invoiceNumber;

    public InvoicePdfGenerationException(String invoiceNumber, String message) {
        super(message);
        this.invoiceNumber = invoiceNumber;
    }

    public InvoicePdfGenerationException(String invoiceNumber, String message, Throwable cause) {
        super(message, cause);
        this.invoiceNumber = invoiceNumber;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }
}
