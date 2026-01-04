package com.contentdiagnostics.credits.dto;

import com.contentdiagnostics.credits.entity.CreditBundle;
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

    public static CreditBundleDto fromEntity(CreditBundle bundle) {
        return CreditBundleDto.builder()
                .id(bundle.getBundleCode())
                .name(bundle.getName())
                .credits(bundle.getCredits())
                .price(bundle.getPrice())
                .description(bundle.getDescription())
                .popular(bundle.getPopular())
                .pricePerCredit(bundle.getPricePerCredit())
                .savingsPercent(bundle.getSavingsPercent())
                .build();
    }
}
