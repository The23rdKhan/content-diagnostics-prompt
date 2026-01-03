package com.contentdiagnostics.billing.dto;

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
public class BillingSummaryDto {
    private BigDecimal currentPlanCost;
    private BigDecimal addonsThisMonth;
    private BigDecimal nextInvoiceAmount;
    private Instant nextInvoiceDate;
    private String currency;
}
