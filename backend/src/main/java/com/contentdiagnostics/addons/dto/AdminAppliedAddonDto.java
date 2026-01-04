package com.contentdiagnostics.addons.dto;

import com.contentdiagnostics.addons.entity.AppliedAddon;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * DTO for admin view of applied addons.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAppliedAddonDto {
    private Long id;
    private String addonCode;
    private String addonName;
    private Long jobId;
    private String jobTitle;
    private Long creatorId;
    private String creatorEmail;
    private String creatorName;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal totalPrice;
    private String status;
    private Instant appliedAt;

    public static AdminAppliedAddonDto fromEntity(AppliedAddon applied) {
        return AdminAppliedAddonDto.builder()
                .id(applied.getId())
                .addonCode(applied.getAddon().getCode())
                .addonName(applied.getAddon().getName())
                .jobId(applied.getJob().getId())
                .jobTitle(applied.getJob().getVideo() != null ? applied.getJob().getVideo().getTitle() : null)
                .creatorId(applied.getCreator().getId())
                .creatorEmail(applied.getCreator().getEmail())
                .creatorName(applied.getCreator().getEmail()) // Use email as display name
                .price(applied.getPrice())
                .quantity(applied.getQuantity())
                .totalPrice(applied.getPrice().multiply(BigDecimal.valueOf(applied.getQuantity())))
                .status(applied.getStatus().name())
                .appliedAt(applied.getAppliedAt())
                .build();
    }
}
