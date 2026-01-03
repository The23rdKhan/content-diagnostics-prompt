package com.contentdiagnostics.addons.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplyAddonRequest {
    @NotBlank(message = "Add-on ID is required")
    private String addonId;

    private Integer quantity;
}
