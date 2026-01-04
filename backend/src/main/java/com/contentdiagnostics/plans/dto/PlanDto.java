package com.contentdiagnostics.plans.dto;

import com.contentdiagnostics.plans.entity.Plan;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

/**
 * DTO for exposing plan information to the frontend.
 */
@Slf4j
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanDto {

    private Long id;
    private String tierCode;
    private String displayName;
    private String description;
    private BigDecimal monthlyPrice;
    private String priceDisplay;
    private Integer creditsPerMonth;
    private Integer reviewersPerVideo;
    private Integer videosPerMonth;
    private Integer slaHours;
    private List<String> features;
    private Boolean active;
    private Boolean popular;

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static PlanDto fromEntity(Plan plan) {
        List<String> features = parseFeatures(plan.getFeaturesJson());

        return PlanDto.builder()
                .id(plan.getId())
                .tierCode(plan.getTierCode())
                .displayName(plan.getDisplayName())
                .description(plan.getDescription())
                .monthlyPrice(plan.getMonthlyPrice())
                .priceDisplay("$" + plan.getMonthlyPrice().stripTrailingZeros().toPlainString())
                .creditsPerMonth(plan.getCreditsPerMonth())
                .reviewersPerVideo(plan.getReviewersPerVideo())
                .videosPerMonth(plan.getVideosPerMonth())
                .slaHours(plan.getSlaHours())
                .features(features)
                .active(plan.getActive())
                .popular("professional".equalsIgnoreCase(plan.getTierCode()))
                .build();
    }

    private static List<String> parseFeatures(String featuresJson) {
        if (featuresJson == null || featuresJson.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(featuresJson, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse features JSON: {}", featuresJson, e);
            return Collections.emptyList();
        }
    }
}
