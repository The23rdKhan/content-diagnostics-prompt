package com.contentdiagnostics.credits.entity;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * Represents a purchasable credit bundle (pay-as-you-go).
 * These are static configurations, not database entities.
 */
@Data
@Builder
public class CreditBundle {

    private String id;
    private String name;
    private int credits;
    private BigDecimal price;
    private String description;
    private boolean popular;
    private BigDecimal pricePerCredit;
    private int savingsPercent;

    /**
     * Get all available credit bundles.
     * Credit pricing:
     * - 5 credits = 1 video (<30 min, 2-3 reviewers, 3-day delivery)
     */
    public static List<CreditBundle> getAvailableBundles() {
        return List.of(
                CreditBundle.builder()
                        .id("starter")
                        .name("Starter Pack")
                        .credits(10)
                        .price(new BigDecimal("15.00"))
                        .description("2 video reviews")
                        .popular(false)
                        .pricePerCredit(new BigDecimal("1.50"))
                        .savingsPercent(0)
                        .build(),
                CreditBundle.builder()
                        .id("creator")
                        .name("Creator Pack")
                        .credits(25)
                        .price(new BigDecimal("30.00"))
                        .description("5 video reviews")
                        .popular(true)
                        .pricePerCredit(new BigDecimal("1.20"))
                        .savingsPercent(20)
                        .build(),
                CreditBundle.builder()
                        .id("pro")
                        .name("Pro Pack")
                        .credits(50)
                        .price(new BigDecimal("50.00"))
                        .description("10 video reviews")
                        .popular(false)
                        .pricePerCredit(new BigDecimal("1.00"))
                        .savingsPercent(33)
                        .build(),
                CreditBundle.builder()
                        .id("studio")
                        .name("Studio Pack")
                        .credits(100)
                        .price(new BigDecimal("85.00"))
                        .description("20 video reviews")
                        .popular(false)
                        .pricePerCredit(new BigDecimal("0.85"))
                        .savingsPercent(43)
                        .build()
        );
    }

    /**
     * Find bundle by ID.
     */
    public static CreditBundle findById(String bundleId) {
        return getAvailableBundles().stream()
                .filter(b -> b.getId().equals(bundleId))
                .findFirst()
                .orElse(null);
    }
}
