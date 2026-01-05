package com.contentdiagnostics.reviewers.controller;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.common.dto.ApiResponse;
import com.contentdiagnostics.common.util.SecurityUtils;
import com.contentdiagnostics.reviewers.dto.*;
import com.contentdiagnostics.reviewers.service.ReviewerService;
import com.contentdiagnostics.tasks.dto.TaskDto;
import com.contentdiagnostics.tasks.dto.TaskHistoryResponse;
import com.contentdiagnostics.tasks.dto.TaskSubmissionRequest;
import com.contentdiagnostics.tasks.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for reviewer endpoints.
 */
@Slf4j
@RestController
@RequestMapping("/reviewer")
@PreAuthorize("hasRole('REVIEWER')")
@RequiredArgsConstructor
public class ReviewerController {

    private final ReviewerService reviewerService;
    private final TaskService taskService;

    /**
     * Get reviewer profile.
     * GET /api/reviewer/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<ReviewerProfileDto>> getProfile() {
        User user = SecurityUtils.getCurrentUser();
        ReviewerProfileDto profile = reviewerService.getProfile(user);

        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    /**
     * Update reviewer profile.
     * PUT /api/reviewer/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<ReviewerProfileDto>> updateProfile(
            @Valid @RequestBody UpdateReviewerProfileRequest request) {

        User user = SecurityUtils.getCurrentUser();
        ReviewerProfileDto profile = reviewerService.updateProfile(user, request);

        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    /**
     * Get qualification test.
     * GET /api/reviewer/qualification/test
     *
     * Returns test questions and eligibility status.
     */
    @GetMapping("/qualification/test")
    public ResponseEntity<ApiResponse<QualificationTestResponse>> getQualificationTest() {
        User user = SecurityUtils.getCurrentUser();
        QualificationTestResponse test = reviewerService.getQualificationTest(user);

        return ResponseEntity.ok(ApiResponse.success(test));
    }

    /**
     * Submit qualification test.
     * POST /api/reviewer/qualification/submit
     */
    @PostMapping("/qualification/submit")
    public ResponseEntity<ApiResponse<ReviewerProfileDto>> submitQualification(
            @Valid @RequestBody QualificationSubmissionRequest request) {

        User user = SecurityUtils.getCurrentUser();
        ReviewerProfileDto profile = reviewerService.submitQualification(user, request);

        return ResponseEntity.ok(ApiResponse.success("Qualification submitted", profile));
    }

    /**
     * Get available tasks.
     * GET /api/reviewer/tasks?status=AVAILABLE
     */
    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<List<TaskDto>>> getTasks(
            @RequestParam(defaultValue = "AVAILABLE") String status) {

        User user = SecurityUtils.getCurrentUser();
        List<TaskDto> tasks = taskService.getAvailableTasks(user, status);

        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    /**
     * Accept a task (lease it).
     * POST /api/reviewer/tasks/{taskId}/accept
     */
    @PostMapping("/tasks/{taskId}/accept")
    public ResponseEntity<ApiResponse<TaskDto>> acceptTask(@PathVariable Long taskId) {

        User user = SecurityUtils.getCurrentUser();
        TaskDto task = taskService.acceptTask(user, taskId);

        return ResponseEntity.ok(ApiResponse.success("Task accepted", task));
    }

    /**
     * Submit a task.
     * POST /api/reviewer/tasks/{taskId}/submit
     */
    @PostMapping("/tasks/{taskId}/submit")
    public ResponseEntity<ApiResponse<TaskDto>> submitTask(
            @PathVariable Long taskId,
            @Valid @RequestBody TaskSubmissionRequest request) {

        User user = SecurityUtils.getCurrentUser();
        TaskDto task = taskService.submitTask(user, taskId, request);

        return ResponseEntity.ok(ApiResponse.success("Task submitted", task));
    }

    /**
     * Get task history.
     * GET /api/reviewer/tasks/history
     */
    @GetMapping("/tasks/history")
    public ResponseEntity<ApiResponse<TaskHistoryResponse>> getTaskHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        User user = SecurityUtils.getCurrentUser();
        TaskHistoryResponse history = taskService.getTaskHistory(user, page, size);

        return ResponseEntity.ok(ApiResponse.success(history));
    }

    /**
     * Get earnings.
     * GET /api/reviewer/earnings
     */
    @GetMapping("/earnings")
    public ResponseEntity<ApiResponse<EarningsResponse>> getEarnings() {
        User user = SecurityUtils.getCurrentUser();
        EarningsResponse earnings = reviewerService.getEarnings(user);

        return ResponseEntity.ok(ApiResponse.success(earnings));
    }

    /**
     * Update payout method.
     * PUT /api/reviewer/payout-method
     */
    @PutMapping("/payout-method")
    public ResponseEntity<ApiResponse<ReviewerProfileDto>> updatePayoutMethod(
            @Valid @RequestBody UpdatePayoutMethodRequest request) {

        User user = SecurityUtils.getCurrentUser();
        ReviewerProfileDto profile = reviewerService.updatePayoutMethod(user, request);

        return ResponseEntity.ok(ApiResponse.success(profile));
    }
}
