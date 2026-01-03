package com.contentdiagnostics.addons.dto;

import com.contentdiagnostics.addons.entity.AppliedAddon;
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
public class ActiveAddonDto {
    private String id;
    private String addonId;
    private String addonName;
    private Long jobId;
    private String jobTitle;
    private Instant appliedDate;
    private String status;
    private BigDecimal price;

    public static ActiveAddonDto fromEntity(AppliedAddon appliedAddon) {
        return ActiveAddonDto.builder()
                .id(String.valueOf(appliedAddon.getId()))
                .addonId(appliedAddon.getAddon().getCode())
                .addonName(appliedAddon.getAddon().getName())
                .jobId(appliedAddon.getJob().getId())
                .jobTitle(appliedAddon.getJob().getVideo().getTitle())
                .appliedDate(appliedAddon.getAppliedAt())
                .status(appliedAddon.getStatus().name())
                .price(appliedAddon.getPrice())
                .build();
    }
}
