package com.contentdiagnostics.admin.controller;

import com.contentdiagnostics.admin.dto.*;
import com.contentdiagnostics.admin.service.AdminService;
import com.contentdiagnostics.common.dto.ApiResponse;
import com.contentdiagnostics.common.dto.PagedResponse;
import com.contentdiagnostics.notifications.dto.EmailLogDto;
import com.contentdiagnostics.notifications.dto.EmailStatsDto;
import com.contentdiagnostics.notifications.entity.EmailLog.EmailStatus;
import com.contentdiagnostics.notifications.entity.NotificationType;
import com.contentdiagnostics.payouts.dto.PayoutDto;
import com.contentdiagnostics.tasks.dto.TaskDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for admin endpoints.
 */
@Slf4j
@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /**
     * Get KPI dashboard.
     * GET /api/admin/kpis
     */
    @GetMapping("/kpis")
    public ResponseEntity<ApiResponse<KpiResponse>> getKpis() {
        KpiResponse kpis = adminService.getKpis();
        return ResponseEntity.ok(ApiResponse.success(kpis));
    }

    /**
     * Get capacity overview.
     * GET /api/admin/capacity
     */
    @GetMapping("/capacity")
    public ResponseEntity<ApiResponse<CapacityResponse>> getCapacity() {
        CapacityResponse capacity = adminService.getCapacity();
        return ResponseEntity.ok(ApiResponse.success(capacity));
    }

    /**
     * Update capacity settings for a language pool.
     * PUT /api/admin/capacity/{languagePool}
     */
    @PutMapping("/capacity/{languagePool}")
    public ResponseEntity<ApiResponse<CapacityResponse.LanguagePoolCapacity>> updateCapacity(
            @PathVariable String languagePool,
            @Valid @RequestBody UpdateCapacityRequest request) {

        CapacityResponse.LanguagePoolCapacity updated = adminService.updateCapacity(languagePool, request);
        return ResponseEntity.ok(ApiResponse.success("Capacity updated", updated));
    }

    /**
     * Get all tasks (admin view).
     * GET /api/admin/tasks
     */
    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<List<TaskDto>>> getTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        List<TaskDto> tasks = adminService.getTasks(page, size);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    /**
     * Bulk task operations.
     * POST /api/admin/tasks/bulk
     */
    @PostMapping("/tasks/bulk")
    public ResponseEntity<ApiResponse<Void>> bulkTaskOperation(
            @RequestBody Object request) {

        // TODO: Implement bulk operations
        return ResponseEntity.ok(ApiResponse.success("Bulk operation completed"));
    }

    /**
     * Get all reviewers.
     * GET /api/admin/reviewers
     */
    @GetMapping("/reviewers")
    public ResponseEntity<ApiResponse<List<AdminReviewerDto>>> getReviewers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        List<AdminReviewerDto> reviewers = adminService.getReviewers(page, size);
        return ResponseEntity.ok(ApiResponse.success(reviewers));
    }

    /**
     * Update a reviewer.
     * PUT /api/admin/reviewers/{id}
     */
    @PutMapping("/reviewers/{id}")
    public ResponseEntity<ApiResponse<AdminReviewerDto>> updateReviewer(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReviewerRequest request) {

        AdminReviewerDto reviewer = adminService.updateReviewer(id, request);
        return ResponseEntity.ok(ApiResponse.success(reviewer));
    }

    /**
     * Get all creators.
     * GET /api/admin/creators
     */
    @GetMapping("/creators")
    public ResponseEntity<ApiResponse<List<AdminCreatorDto>>> getCreators(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        List<AdminCreatorDto> creators = adminService.getCreators(page, size);
        return ResponseEntity.ok(ApiResponse.success(creators));
    }

    /**
     * Issue credits to a creator.
     * POST /api/admin/creators/{id}/credit
     */
    @PostMapping("/creators/{id}/credit")
    public ResponseEntity<ApiResponse<AdminCreatorDto>> issueCredits(
            @PathVariable Long id,
            @Valid @RequestBody IssueCreditRequest request) {

        AdminCreatorDto creator = adminService.issueCredits(id, request);
        return ResponseEntity.ok(ApiResponse.success("Credits issued", creator));
    }

    /**
     * Get all payouts.
     * GET /api/admin/payouts
     */
    @GetMapping("/payouts")
    public ResponseEntity<ApiResponse<List<PayoutDto>>> getPayouts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        List<PayoutDto> payouts = adminService.getPayouts(page, size);
        return ResponseEntity.ok(ApiResponse.success(payouts));
    }

    /**
     * Release a payout.
     * POST /api/admin/payouts/{id}/release
     */
    @PostMapping("/payouts/{id}/release")
    public ResponseEntity<ApiResponse<PayoutDto>> releasePayout(@PathVariable Long id) {
        PayoutDto payout = adminService.releasePayout(id);
        return ResponseEntity.ok(ApiResponse.success("Payout released", payout));
    }

    // ==================== Email Logs ====================

    /**
     * Get email statistics.
     * GET /api/admin/emails/stats
     */
    @GetMapping("/emails/stats")
    public ResponseEntity<ApiResponse<EmailStatsDto>> getEmailStats() {
        EmailStatsDto stats = adminService.getEmailStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    /**
     * Get email logs with optional filters.
     * GET /api/admin/emails
     */
    @GetMapping("/emails")
    public ResponseEntity<ApiResponse<PagedResponse<EmailLogDto>>> getEmailLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) EmailStatus status,
            @RequestParam(required = false) NotificationType type,
            @RequestParam(required = false) String email) {

        PagedResponse<EmailLogDto> logs = adminService.getEmailLogs(page, size, status, type, email);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    /**
     * Get email log by ID.
     * GET /api/admin/emails/{id}
     */
    @GetMapping("/emails/{id}")
    public ResponseEntity<ApiResponse<EmailLogDto>> getEmailLog(@PathVariable Long id) {
        EmailLogDto log = adminService.getEmailLog(id);
        return ResponseEntity.ok(ApiResponse.success(log));
    }
}
