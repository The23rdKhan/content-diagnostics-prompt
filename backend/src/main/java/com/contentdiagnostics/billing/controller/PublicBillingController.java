package com.contentdiagnostics.billing.controller;

import com.contentdiagnostics.common.dto.ApiResponse;
import com.contentdiagnostics.creators.dto.PlanDto;
import com.contentdiagnostics.creators.service.CreatorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public billing endpoints that don't require authentication.
 * Used during onboarding flow.
 */
@Slf4j
@RestController
@RequestMapping("/billing")
@RequiredArgsConstructor
public class PublicBillingController {

    private final CreatorService creatorService;

    /**
     * Get available subscription plans (public).
     * GET /api/billing/plans
     */
    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<PlanDto>>> getPlans() {
        List<PlanDto> plans = creatorService.getAvailablePlans();
        return ResponseEntity.ok(ApiResponse.success(plans));
    }
}
