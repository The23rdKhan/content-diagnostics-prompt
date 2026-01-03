package com.contentdiagnostics.creators.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for subscription plan details.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanDto {

    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private String priceDisplay;
    private String billingPeriod;
    private Integer reviewersPerVideo;
    private Integer videosPerMonth;
    private List<String> features;
    private Boolean popular;
}
