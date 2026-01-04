package com.contentdiagnostics.addons.dto;

import com.contentdiagnostics.addons.entity.Addon;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for admin addon management.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAddonDto {
    private Long id;
    private String code;
    private String name;
    private String description;
    private BigDecimal price;
    private String priceDisplay;
    private String category;
    private Boolean active;
    private Long appliedCount;

    public static AdminAddonDto fromEntity(Addon addon) {
        return AdminAddonDto.builder()
                .id(addon.getId())
                .code(addon.getCode())
                .name(addon.getName())
                .description(addon.getDescription())
                .price(addon.getPrice())
                .priceDisplay(addon.getPriceDisplay())
                .category(addon.getCategory().name())
                .active(addon.getActive())
                .build();
    }

    public static AdminAddonDto fromEntity(Addon addon, Long appliedCount) {
        AdminAddonDto dto = fromEntity(addon);
        dto.setAppliedCount(appliedCount);
        return dto;
    }
}
