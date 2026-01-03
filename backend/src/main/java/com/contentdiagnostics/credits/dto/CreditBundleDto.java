package com.contentdiagnostics.credits.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for purchasable credit bundle.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditBundleDto {

    private String id;
    private String name;
    private Integer credits;
    private BigDecimal price;
    private String description;
    private Boolean popular;
    private BigDecimal pricePerCredit;
    private Integer savingsPercent;
}
