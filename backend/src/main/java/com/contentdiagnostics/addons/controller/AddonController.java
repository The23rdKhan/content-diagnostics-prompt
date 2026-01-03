package com.contentdiagnostics.addons.controller;

import com.contentdiagnostics.addons.dto.ActiveAddonDto;
import com.contentdiagnostics.addons.dto.AddonDto;
import com.contentdiagnostics.addons.dto.ApplyAddonRequest;
import com.contentdiagnostics.addons.service.AddonService;
import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.common.dto.ApiResponse;
import com.contentdiagnostics.common.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for add-on endpoints.
 */
@Slf4j
@RestController
@RequestMapping("/creator")
@PreAuthorize("hasRole('CREATOR')")
@RequiredArgsConstructor
public class AddonController {

    private final AddonService addonService;

    /**
     * Get all available add-ons.
     * GET /api/creator/addons
     */
    @GetMapping("/addons")
    public ResponseEntity<ApiResponse<Map<String, List<AddonDto>>>> getAvailableAddons() {
        List<AddonDto> addons = addonService.getAvailableAddons();
        return ResponseEntity.ok(ApiResponse.success(Map.of("addons", addons)));
    }

    /**
     * Get creator's active add-ons.
     * GET /api/creator/addons/active
     */
    @GetMapping("/addons/active")
    public ResponseEntity<ApiResponse<Map<String, List<ActiveAddonDto>>>> getActiveAddons() {
        User user = SecurityUtils.getCurrentUser();
        List<ActiveAddonDto> activeAddons = addonService.getActiveAddons(user);
        return ResponseEntity.ok(ApiResponse.success(Map.of("activeAddons", activeAddons)));
    }

    /**
     * Apply an add-on to a job.
     * POST /api/creator/jobs/{jobId}/addons
     */
    @PostMapping("/jobs/{jobId}/addons")
    public ResponseEntity<ApiResponse<ActiveAddonDto>> applyAddon(
            @PathVariable Long jobId,
            @Valid @RequestBody ApplyAddonRequest request) {

        User user = SecurityUtils.getCurrentUser();
        ActiveAddonDto appliedAddon = addonService.applyAddon(user, jobId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Add-on applied", appliedAddon));
    }
}
