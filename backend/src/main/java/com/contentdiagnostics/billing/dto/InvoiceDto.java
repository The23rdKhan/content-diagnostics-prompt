package com.contentdiagnostics.billing.dto;

import com.contentdiagnostics.billing.entity.Invoice;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDto {
    private String id;
    private String invoiceNumber;
    private Instant date;
    private BigDecimal amount;
    private String status;
    private String pdfUrl;
    private String currency;

    public static InvoiceDto fromEntity(Invoice invoice) {
        return InvoiceDto.builder()
                .id(String.valueOf(invoice.getId()))
                .invoiceNumber(invoice.getInvoiceNumber())
                .date(invoice.getCreatedAt())
                .amount(invoice.getAmount())
                .status(invoice.getStatus().name())
                .pdfUrl(invoice.getPdfUrl())
                .currency(invoice.getCurrency())
                .build();
    }
}
