package com.contentdiagnostics.addons.dto;

import com.contentdiagnostics.addons.entity.Addon;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Request DTO for creating a new addon.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAddonRequest {

    @NotBlank(message = "Code is required")
    @Pattern(regexp = "^[a-z0-9_]+$", message = "Code must be lowercase alphanumeric with underscores")
    private String code;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;

    @NotNull(message = "Category is required")
    private Addon.AddonCategory category;

    @Builder.Default
    private Boolean active = true;
}
