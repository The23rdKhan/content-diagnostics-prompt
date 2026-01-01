package com.contentdiagnostics.payouts.controller;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.common.dto.ApiResponse;
import com.contentdiagnostics.common.util.SecurityUtils;
import com.contentdiagnostics.payouts.dto.PayoutDto;
import com.contentdiagnostics.payouts.dto.RequestPayoutRequest;
import com.contentdiagnostics.payouts.entity.PayoutStatus;
import com.contentdiagnostics.payouts.service.PayoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for payout operations.
 */
@Slf4j
@RestController
@RequestMapping("/payouts")
@RequiredArgsConstructor
public class PayoutController {

    private final PayoutService payoutService;

    // ==================== REVIEWER ENDPOINTS ====================

    /**
     * Get all payouts for current reviewer.
     * GET /api/payouts
     */
    @GetMapping
    @PreAuthorize("hasRole('REVIEWER')")
    public ResponseEntity<ApiResponse<List<PayoutDto>>> getMyPayouts() {
        User user = SecurityUtils.getCurrentUser();
        List<PayoutDto> payouts = payoutService.getReviewerPayouts(user);

        return ResponseEntity.ok(ApiResponse.success(payouts));
    }

    /**
     * Request a payout.
     * POST /api/payouts/request
     */
    @PostMapping("/request")
    @PreAuthorize("hasRole('REVIEWER')")
    public ResponseEntity<ApiResponse<PayoutDto>> requestPayout(
            @Valid @RequestBody(required = false) RequestPayoutRequest request) {

        User user = SecurityUtils.getCurrentUser();
        PayoutDto payout = payoutService.requestPayout(user,
                request != null ? request : new RequestPayoutRequest());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payout requested successfully", payout));
    }

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * Get payouts by status (admin).
     * GET /api/payouts/admin?status=PENDING
     */
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<PayoutDto>>> getPayoutsByStatus(
            @RequestParam PayoutStatus status,
            Pageable pageable) {

        Page<PayoutDto> payouts = payoutService.getPayoutsByStatus(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(payouts));
    }

    /**
     * Get payouts ready for release (admin).
     * GET /api/payouts/admin/ready
     */
    @GetMapping("/admin/ready")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PayoutDto>>> getReadyPayouts() {
        List<PayoutDto> payouts = payoutService.getPendingPayouts();
        return ResponseEntity.ok(ApiResponse.success(payouts));
    }

    /**
     * Get payout by ID (admin).
     * GET /api/payouts/admin/{id}
     */
    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PayoutDto>> getPayoutById(@PathVariable Long id) {
        PayoutDto payout = payoutService.getPayoutById(id);
        return ResponseEntity.ok(ApiResponse.success(payout));
    }

    /**
     * Advance payout to QC (admin).
     * POST /api/payouts/admin/{id}/qc
     */
    @PostMapping("/admin/{id}/qc")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PayoutDto>> advanceToQc(@PathVariable Long id) {
        PayoutDto payout = payoutService.advanceToQc(id);
        return ResponseEntity.ok(ApiResponse.success("Payout advanced to QC", payout));
    }

    /**
     * Mark payout as ready (admin).
     * POST /api/payouts/admin/{id}/ready
     */
    @PostMapping("/admin/{id}/ready")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PayoutDto>> markReady(@PathVariable Long id) {
        PayoutDto payout = payoutService.markReady(id);
        return ResponseEntity.ok(ApiResponse.success("Payout marked ready", payout));
    }

    /**
     * Release payout (admin).
     * POST /api/payouts/admin/{id}/release
     */
    @PostMapping("/admin/{id}/release")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PayoutDto>> releasePayout(
            @PathVariable Long id,
            @RequestParam(required = false) String transactionId) {

        PayoutDto payout = payoutService.releasePayout(id, transactionId);
        return ResponseEntity.ok(ApiResponse.success("Payout released", payout));
    }
}
