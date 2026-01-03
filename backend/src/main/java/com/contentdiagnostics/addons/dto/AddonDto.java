package com.contentdiagnostics.addons.dto;

import com.contentdiagnostics.addons.entity.Addon;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddonDto {
    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private String priceDisplay;
    private String category;

    public static AddonDto fromEntity(Addon addon) {
        return AddonDto.builder()
                .id(addon.getCode())
                .name(addon.getName())
                .description(addon.getDescription())
                .price(addon.getPrice())
                .priceDisplay(addon.getPriceDisplay())
                .category(addon.getCategory().name())
                .build();
    }
}
