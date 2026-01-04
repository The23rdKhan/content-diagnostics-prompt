package com.contentdiagnostics.creators.controller;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.common.dto.ApiResponse;
import com.contentdiagnostics.common.util.SecurityUtils;
import com.contentdiagnostics.creators.dto.CreatorProfileDto;
import com.contentdiagnostics.creators.dto.PlanDto;
import com.contentdiagnostics.creators.dto.SubscriptionDto;
import com.contentdiagnostics.creators.dto.UpdateCreatorProfileRequest;
import com.contentdiagnostics.creators.service.CreatorService;
import com.contentdiagnostics.jobs.dto.JobDto;
import com.contentdiagnostics.jobs.dto.SubmitVideoRequest;
import com.contentdiagnostics.jobs.service.JobService;
import com.contentdiagnostics.reports.dto.ReportComparisonResponse;
import com.contentdiagnostics.reports.dto.ReportDto;
import com.contentdiagnostics.reports.service.ReportService;
import com.contentdiagnostics.videos.dto.CreateVideoRequest;
import com.contentdiagnostics.videos.dto.VideoDto;
import com.contentdiagnostics.videos.service.VideoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for creator endpoints.
 */
@Slf4j
@RestController
@RequestMapping("/creator")
@PreAuthorize("hasRole('CREATOR')")
@RequiredArgsConstructor
public class CreatorController {

    private final CreatorService creatorService;
    private final VideoService videoService;
    private final JobService jobService;
    private final ReportService reportService;

    /**
     * Get available subscription plans.
     * GET /api/creator/plans
     */
    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<PlanDto>>> getPlans() {
        List<PlanDto> plans = creatorService.getAvailablePlans();
        return ResponseEntity.ok(ApiResponse.success(plans));
    }

    /**
     * Get current creator's subscription.
     * GET /api/creator/subscription
     */
    @GetMapping("/subscription")
    public ResponseEntity<ApiResponse<SubscriptionDto>> getSubscription() {
        User user = SecurityUtils.getCurrentUser();
        SubscriptionDto subscription = creatorService.getSubscription(user);
        return ResponseEntity.ok(ApiResponse.success(subscription));
    }

    /**
     * Activate subscription (mock mode for development).
     * POST /api/creator/subscription/activate
     */
    @PostMapping("/subscription/activate")
    public ResponseEntity<ApiResponse<SubscriptionDto>> activateSubscription(
            @RequestParam String planTier) {
        User user = SecurityUtils.getCurrentUser();
        SubscriptionDto subscription = creatorService.activateSubscription(user, planTier);
        return ResponseEntity.ok(ApiResponse.success("Subscription activated", subscription));
    }

    /**
     * Get current creator's profile.
     * GET /api/creator/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<CreatorProfileDto>> getProfile() {
        User user = SecurityUtils.getCurrentUser();
        CreatorProfileDto profile = creatorService.getProfile(user);

        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    /**
     * Update current creator's profile.
     * PUT /api/creator/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<CreatorProfileDto>> updateProfile(
            @Valid @RequestBody UpdateCreatorProfileRequest request) {

        User user = SecurityUtils.getCurrentUser();
        CreatorProfileDto profile = creatorService.updateProfile(user, request);

        return ResponseEntity.ok(ApiResponse.success("Profile updated", profile));
    }

    /**
     * Create a new video record.
     * POST /api/creator/videos
     */
    @PostMapping("/videos")
    public ResponseEntity<ApiResponse<VideoDto>> createVideo(
            @Valid @RequestBody CreateVideoRequest request) {

        User user = SecurityUtils.getCurrentUser();
        VideoDto video = videoService.createVideo(user, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Video created", video));
    }

    /**
     * Get all videos for current creator.
     * GET /api/creator/videos
     */
    @GetMapping("/videos")
    public ResponseEntity<ApiResponse<List<VideoDto>>> getVideos() {
        User user = SecurityUtils.getCurrentUser();
        List<VideoDto> videos = videoService.getCreatorVideos(user);

        return ResponseEntity.ok(ApiResponse.success(videos));
    }

    /**
     * Submit a video for review (creates a job).
     * POST /api/creator/videos/{videoId}/submit
     */
    @PostMapping("/videos/{videoId}/submit")
    public ResponseEntity<ApiResponse<JobDto>> submitVideo(
            @PathVariable Long videoId,
            @Valid @RequestBody(required = false) SubmitVideoRequest request) {

        User user = SecurityUtils.getCurrentUser();
        JobDto job = jobService.submitVideoForReview(user, videoId,
                request != null ? request : new SubmitVideoRequest());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Video submitted for review", job));
    }

    /**
     * Get all jobs for current creator.
     * GET /api/creator/jobs
     */
    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<List<JobDto>>> getJobs() {
        User user = SecurityUtils.getCurrentUser();
        List<JobDto> jobs = jobService.getCreatorJobs(user);

        return ResponseEntity.ok(ApiResponse.success(jobs));
    }

    /**
     * Cancel a job and refund credits.
     * POST /api/creator/jobs/{jobId}/cancel
     */
    @PostMapping("/jobs/{jobId}/cancel")
    public ResponseEntity<ApiResponse<JobDto>> cancelJob(@PathVariable Long jobId) {
        User user = SecurityUtils.getCurrentUser();
        JobDto job = jobService.cancelJob(user, jobId);

        return ResponseEntity.ok(ApiResponse.success("Job cancelled and credits refunded", job));
    }

    /**
     * Get all reports for current creator.
     * GET /api/creator/reports
     */
    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<List<ReportDto>>> getReports() {
        User user = SecurityUtils.getCurrentUser();
        List<ReportDto> reports = reportService.getCreatorReports(user);

        return ResponseEntity.ok(ApiResponse.success(reports));
    }

    /**
     * Get a specific report.
     * GET /api/creator/reports/{reportId}
     */
    @GetMapping("/reports/{reportId}")
    public ResponseEntity<ApiResponse<ReportDto>> getReport(@PathVariable Long reportId) {
        User user = SecurityUtils.getCurrentUser();
        ReportDto report = reportService.getReport(user, reportId);

        return ResponseEntity.ok(ApiResponse.success(report));
    }

    /**
     * Compare two reports.
     * GET /api/creator/reports/compare?left=...&right=...
     */
    @GetMapping("/reports/compare")
    public ResponseEntity<ApiResponse<ReportComparisonResponse>> compareReports(
            @RequestParam Long left,
            @RequestParam Long right) {

        User user = SecurityUtils.getCurrentUser();
        ReportComparisonResponse comparison = reportService.compareReports(user, left, right);

        return ResponseEntity.ok(ApiResponse.success(comparison));
    }
}
