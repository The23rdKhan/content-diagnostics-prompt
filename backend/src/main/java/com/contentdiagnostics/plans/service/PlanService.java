package com.contentdiagnostics.plans.service;

import com.contentdiagnostics.common.config.CacheConfig;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.plans.dto.PlanDto;
import com.contentdiagnostics.plans.entity.Plan;
import com.contentdiagnostics.plans.repository.PlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for accessing plan configuration.
 * Provides methods to retrieve plan details by tier code.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PlanService {

    private final PlanRepository planRepository;

    /**
     * Get all active plans for display to users.
     * Results are cached for performance.
     */
    @Cacheable(value = CacheConfig.PLANS_CACHE, key = "'allActivePlans'")
    @Transactional(readOnly = true)
    public List<PlanDto> getActivePlans() {
        log.debug("Loading active plans from database");
        return planRepository.findByActiveTrueOrderBySortOrderAsc().stream()
                .map(PlanDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get a plan by its tier code.
     * Results are cached by tier code.
     */
    @Cacheable(value = CacheConfig.PLANS_CACHE, key = "#tierCode.toLowerCase()")
    @Transactional(readOnly = true)
    public PlanDto getPlanByTierCode(String tierCode) {
        log.debug("Loading plan {} from database", tierCode);
        Plan plan = planRepository.findByTierCode(tierCode.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Plan", tierCode));
        return PlanDto.fromEntity(plan);
    }

    /**
     * Get the monthly price for a plan tier.
     * Uses cached plan data.
     */
    public BigDecimal getPlanPrice(String tierCode) {
        return getPlanByTierCode(tierCode).getMonthlyPrice();
    }

    /**
     * Get credits per month for a plan tier.
     * Uses cached plan data.
     */
    public int getCreditsPerMonth(String tierCode) {
        return getPlanByTierCode(tierCode).getCreditsPerMonth();
    }

    /**
     * Get reviewers per video for a plan tier.
     * Uses cached plan data.
     */
    public int getReviewersPerVideo(String tierCode) {
        return getPlanByTierCode(tierCode).getReviewersPerVideo();
    }

    /**
     * Get SLA hours for a plan tier.
     * Uses cached plan data.
     */
    public int getSlaHours(String tierCode) {
        Integer slaHours = getPlanByTierCode(tierCode).getSlaHours();
        return slaHours != null ? slaHours : 72; // Default 72 hours
    }

    /**
     * Check if a plan tier code exists.
     */
    @Transactional(readOnly = true)
    public boolean planExists(String tierCode) {
        return planRepository.existsByTierCode(tierCode.toLowerCase());
    }

    /**
     * Get the raw Plan entity by tier code (for internal use).
     * Note: This is not cached - use getPlanByTierCode() for cached access.
     */
    @Transactional(readOnly = true)
    public Plan getPlanEntity(String tierCode) {
        return planRepository.findByTierCode(tierCode.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Plan", tierCode));
    }
}
