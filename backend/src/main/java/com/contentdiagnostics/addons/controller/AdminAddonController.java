package com.contentdiagnostics.addons.controller;

import com.contentdiagnostics.addons.dto.*;
import com.contentdiagnostics.addons.service.AddonService;
import com.contentdiagnostics.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for admin addon management endpoints.
 */
@Slf4j
@RestController
@RequestMapping("/admin/addons")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminAddonController {

    private final AddonService addonService;

    /**
     * Get all addons (including inactive).
     * GET /api/admin/addons
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminAddonDto>>> getAllAddons() {
        List<AdminAddonDto> addons = addonService.getAllAddons();
        return ResponseEntity.ok(ApiResponse.success(addons));
    }

    /**
     * Get addon statistics.
     * GET /api/admin/addons/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AddonStatsDto>> getAddonStats() {
        AddonStatsDto stats = addonService.getAddonStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    /**
     * Get a specific addon by ID.
     * GET /api/admin/addons/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminAddonDto>> getAddon(@PathVariable Long id) {
        AdminAddonDto addon = addonService.getAddon(id);
        return ResponseEntity.ok(ApiResponse.success(addon));
    }

    /**
     * Create a new addon.
     * POST /api/admin/addons
     */
    @PostMapping
    public ResponseEntity<ApiResponse<AdminAddonDto>> createAddon(
            @Valid @RequestBody CreateAddonRequest request) {
        AdminAddonDto addon = addonService.createAddon(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Addon created", addon));
    }

    /**
     * Update an existing addon.
     * PUT /api/admin/addons/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminAddonDto>> updateAddon(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAddonRequest request) {
        AdminAddonDto addon = addonService.updateAddon(id, request);
        return ResponseEntity.ok(ApiResponse.success("Addon updated", addon));
    }

    /**
     * Activate an addon.
     * POST /api/admin/addons/{id}/activate
     */
    @PostMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<AdminAddonDto>> activateAddon(@PathVariable Long id) {
        AdminAddonDto addon = addonService.setAddonActive(id, true);
        return ResponseEntity.ok(ApiResponse.success("Addon activated", addon));
    }

    /**
     * Deactivate an addon.
     * POST /api/admin/addons/{id}/deactivate
     */
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<AdminAddonDto>> deactivateAddon(@PathVariable Long id) {
        AdminAddonDto addon = addonService.setAddonActive(id, false);
        return ResponseEntity.ok(ApiResponse.success("Addon deactivated", addon));
    }

    /**
     * Get all applied addons (purchases).
     * GET /api/admin/addons/applied
     */
    @GetMapping("/applied")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAppliedAddons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<AdminAppliedAddonDto> applied = addonService.getAppliedAddons(page, size);
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "content", applied.getContent(),
                "totalElements", applied.getTotalElements(),
                "totalPages", applied.getTotalPages(),
                "currentPage", applied.getNumber()
        )));
    }
}
