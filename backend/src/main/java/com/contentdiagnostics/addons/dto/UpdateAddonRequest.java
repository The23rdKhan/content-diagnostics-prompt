package com.contentdiagnostics.addons.dto;

import com.contentdiagnostics.addons.entity.Addon;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Request DTO for updating an addon.
 * All fields are optional - only provided fields will be updated.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAddonRequest {
    private String name;
    private String description;

    @Positive(message = "Price must be positive")
    private BigDecimal price;

    private Addon.AddonCategory category;
    private Boolean active;
}
