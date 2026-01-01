package com.contentdiagnostics.admin.controller;

import com.contentdiagnostics.admin.dto.AdminDebugCompileRequest;
import com.contentdiagnostics.admin.dto.AdminDebugCompileResponse;
import com.contentdiagnostics.admin.dto.AdminDebugRequeueResponse;
import com.contentdiagnostics.admin.dto.AdminDebugSampleResponse;
import com.contentdiagnostics.admin.service.AdminDebugService;
import com.contentdiagnostics.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Staging-only admin debug endpoints.
 */
@RestController
@RequestMapping("/admin/debug")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminDebugController {

    private final AdminDebugService adminDebugService;

    /**
     * Create a sample job and tasks for local testing.
     */
    @PostMapping("/sample-data")
    public ResponseEntity<ApiResponse<AdminDebugSampleResponse>> createSampleData() {
        AdminDebugSampleResponse response = adminDebugService.createSampleJobAndTasks();
        return ResponseEntity.ok(ApiResponse.success("Sample data created", response));
    }

    /**
     * Trigger report compilation for the latest job or the specified job ID.
     */
    @PostMapping("/compile-report")
    public ResponseEntity<ApiResponse<AdminDebugCompileResponse>> compileReport(
            @RequestBody(required = false) AdminDebugCompileRequest request) {
        Long jobId = request != null ? request.getJobId() : null;
        AdminDebugCompileResponse response = adminDebugService.triggerReportCompilation(jobId);
        return ResponseEntity.ok(ApiResponse.success("Report compiled", response));
    }

    /**
     * Requeue expired task leases immediately.
     */
    @PostMapping("/requeue-expired")
    public ResponseEntity<ApiResponse<AdminDebugRequeueResponse>> requeueExpired() {
        AdminDebugRequeueResponse response = adminDebugService.requeueExpiredLeases();
        return ResponseEntity.ok(ApiResponse.success("Expired leases requeued", response));
    }
}
