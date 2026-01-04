package com.contentdiagnostics.admin.service;

import com.contentdiagnostics.admin.dto.*;
import com.contentdiagnostics.audit.service.AuditService;
import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.auth.entity.UserRole;
import com.contentdiagnostics.auth.repository.UserRepository;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.common.util.SecurityUtils;
import com.contentdiagnostics.creators.entity.CreatorProfile;
import com.contentdiagnostics.creators.repository.CreatorProfileRepository;
import com.contentdiagnostics.credits.entity.CreditTransactionType;
import com.contentdiagnostics.credits.service.CreditService;
import com.contentdiagnostics.jobs.entity.JobStatus;
import com.contentdiagnostics.jobs.repository.JobRepository;
import com.contentdiagnostics.payouts.dto.PayoutDto;
import com.contentdiagnostics.payouts.entity.Payout;
import com.contentdiagnostics.payouts.entity.PayoutStatus;
import com.contentdiagnostics.payouts.repository.PayoutRepository;
import com.contentdiagnostics.reviewers.entity.ReviewerProfile;
import com.contentdiagnostics.reviewers.repository.ReviewerProfileRepository;
import com.contentdiagnostics.tasks.entity.TaskStatus;
import com.contentdiagnostics.tasks.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for admin operations.
 * All mutating operations are audit-logged for compliance and security.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final CreatorProfileRepository creatorProfileRepository;
    private final ReviewerProfileRepository reviewerProfileRepository;
    private final JobRepository jobRepository;
    private final TaskRepository taskRepository;
    private final PayoutRepository payoutRepository;
    private final AuditService auditService;
    private final CreditService creditService;

    /**
     * Get KPI dashboard data.
     */
    @Transactional(readOnly = true)
    public KpiResponse getKpis() {
        long totalCreators = userRepository.countByRole(UserRole.CREATOR);
        long totalReviewers = userRepository.countByRole(UserRole.REVIEWER);
        long activeReviewers = reviewerProfileRepository.countActiveByLanguage("English");

        // Use efficient count queries instead of fetching all entities
        long pendingTasks = taskRepository.countByStatus(TaskStatus.AVAILABLE);

        List<JobStatus> inProgressStatuses = List.of(JobStatus.PROCESSING, JobStatus.IN_REVIEW, JobStatus.COMPILING);
        long jobsInProgress = jobRepository.countByStatusIn(inProgressStatuses);

        return KpiResponse.builder()
                .totalCreators(totalCreators)
                .totalReviewers(totalReviewers)
                .activeReviewers(activeReviewers)
                .pendingTasks(pendingTasks)
                .tasksCompletedToday(0L) // TODO: Implement daily stats
                .jobsInProgress(jobsInProgress)
                .jobsDeliveredToday(0L) // TODO: Implement daily stats
                .avgDeliveryTimeHours(36.0) // TODO: Calculate from actual data
                .slaComplianceRate(0.95) // TODO: Calculate from actual data
                .build();
    }

    /**
     * Get capacity overview for all language pools.
     */
    @Transactional(readOnly = true)
    public CapacityResponse getCapacity() {
        // For MVP, English only
        long activeEnglish = reviewerProfileRepository.countActiveByLanguage("English");
        long pendingEnglish = jobRepository.countActiveByLanguage("English");

        CapacityResponse.LanguagePoolCapacity english = CapacityResponse.LanguagePoolCapacity.builder()
                .id("1")
                .name("English (Global)")
                .code("en")
                .capacityScore(85)
                .currentSLA("24h")
                .maxReviewersPerVideo(5)
                .checkoutEnabled(true)
                .liveAddOnEnabled(true)
                .activeReviewers(activeEnglish)
                .pendingTasks(pendingEnglish)
                .avgDeliveryTime("18h")
                .build();

        return CapacityResponse.builder()
                .languagePools(List.of(english))
                .build();
    }

    /**
     * Get all reviewers for admin management.
     */
    @Transactional(readOnly = true)
    public List<AdminReviewerDto> getReviewers(int page, int size) {
        Page<ReviewerProfile> reviewers = reviewerProfileRepository.findAll(PageRequest.of(page, size));
        return reviewers.stream().map(this::mapReviewerToDto).collect(Collectors.toList());
    }

    /**
     * Update a reviewer.
     * Audit-logged for compliance.
     */
    @Transactional
    public AdminReviewerDto updateReviewer(Long reviewerId, UpdateReviewerRequest request) {
        User admin = SecurityUtils.getCurrentUser();
        ReviewerProfile profile = reviewerProfileRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer", reviewerId.toString()));

        // Capture old values for audit
        Map<String, Object> oldValues = new HashMap<>();
        oldValues.put("strikes", profile.getStrikes());
        oldValues.put("qualityScore", profile.getQualityScore());
        oldValues.put("queueLocked", profile.isQueueLocked());
        oldValues.put("qualificationPassed", profile.isQualificationPassed());

        // Apply changes
        if (request.getStrikes() != null) {
            profile.setStrikes(request.getStrikes());
        }
        if (request.getQualityScore() != null) {
            profile.setQualityScore(request.getQualityScore());
        }
        if (request.getQueueLocked() != null) {
            profile.setQueueLocked(request.getQueueLocked());
        }
        if (request.getQualificationPassed() != null) {
            profile.setQualificationPassed(request.getQualificationPassed());
        }

        profile = reviewerProfileRepository.save(profile);

        // Capture new values for audit
        Map<String, Object> newValues = new HashMap<>();
        newValues.put("strikes", profile.getStrikes());
        newValues.put("qualityScore", profile.getQualityScore());
        newValues.put("queueLocked", profile.isQueueLocked());
        newValues.put("qualificationPassed", profile.isQualificationPassed());

        // Audit log the change
        auditService.recordAdminAction(
                admin,
                "REVIEWER_UPDATE",
                "REVIEWER",
                reviewerId,
                String.format("Updated reviewer %s", profile.getName()),
                oldValues,
                newValues
        );

        log.info("Admin updated reviewer {}", reviewerId);

        return mapReviewerToDto(profile);
    }

    /**
     * Get all creators for admin management.
     */
    @Transactional(readOnly = true)
    public List<AdminCreatorDto> getCreators(int page, int size) {
        Page<CreatorProfile> creators = creatorProfileRepository.findAll(PageRequest.of(page, size));
        return creators.stream().map(this::mapCreatorToDto).collect(Collectors.toList());
    }

    /**
     * Issue credits to a creator.
     * Audit-logged for compliance.
     */
    @Transactional
    public AdminCreatorDto issueCredits(Long creatorId, IssueCreditRequest request) {
        User admin = SecurityUtils.getCurrentUser();
        CreatorProfile profile = creatorProfileRepository.findById(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("Creator", creatorId.toString()));

        int oldCredits = profile.getRemainingCredits();

        // Determine credit type (defaults to ADMIN_ISSUE)
        CreditTransactionType type = request.getType() != null
                ? request.getType()
                : CreditTransactionType.ADMIN_ISSUE;

        // Issue credits via CreditService (creates transaction record)
        if (type == CreditTransactionType.PROMO) {
            creditService.issuePromoCredits(profile, request.getCredits(), request.getReason());
        } else {
            creditService.issueAdminCredits(profile, request.getCredits(), request.getReason());
        }

        // Refresh profile to get updated balance
        profile = creatorProfileRepository.findById(creatorId).orElseThrow();

        // Audit log the credit issuance
        Map<String, Object> oldValues = Map.of("remainingCredits", oldCredits);
        Map<String, Object> newValues = Map.of(
                "remainingCredits", profile.getRemainingCredits(),
                "creditsIssued", request.getCredits(),
                "type", type.name(),
                "reason", request.getReason() != null ? request.getReason() : "No reason provided"
        );

        auditService.recordAdminAction(
                admin,
                "CREDIT_ISSUE",
                "CREATOR",
                creatorId,
                String.format("Issued %d %s credits to %s: %s",
                        request.getCredits(), type.name(), profile.getName(), request.getReason()),
                oldValues,
                newValues
        );

        log.info("Admin issued {} {} credits to creator {}: {}",
                request.getCredits(), type.name(), creatorId, request.getReason());

        return mapCreatorToDto(profile);
    }

    /**
     * Get all payouts for admin management.
     */
    @Transactional(readOnly = true)
    public List<PayoutDto> getPayouts(int page, int size) {
        Page<Payout> payouts = payoutRepository.findAll(PageRequest.of(page, size));
        return payouts.stream().map(this::mapPayoutToDto).collect(Collectors.toList());
    }

    /**
     * Release a payout.
     * Audit-logged for compliance.
     */
    @Transactional
    public PayoutDto releasePayout(Long payoutId) {
        User admin = SecurityUtils.getCurrentUser();
        Payout payout = payoutRepository.findById(payoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Payout", payoutId.toString()));

        PayoutStatus oldStatus = payout.getStatus();
        payout.setStatus(PayoutStatus.RELEASED);
        payout.setReleasedAt(Instant.now());
        payout = payoutRepository.save(payout);

        // Update reviewer's earnings
        reviewerProfileRepository.processPayout(payout.getReviewer().getId(), payout.getAmount());

        // Audit log the payout release
        Map<String, Object> oldValues = Map.of("status", oldStatus.name());
        Map<String, Object> newValues = Map.of(
                "status", payout.getStatus().name(),
                "releasedAt", payout.getReleasedAt().toString(),
                "amount", payout.getAmount(),
                "reviewerId", payout.getReviewer().getId()
        );

        auditService.recordAdminAction(
                admin,
                "PAYOUT_RELEASE",
                "PAYOUT",
                payoutId,
                String.format("Released payout of $%.2f to %s",
                        payout.getAmount(), payout.getReviewer().getName()),
                oldValues,
                newValues
        );

        log.info("Admin released payout {} for ${}", payoutId, payout.getAmount());

        return mapPayoutToDto(payout);
    }

    // --- Helper methods ---

    private AdminReviewerDto mapReviewerToDto(ReviewerProfile profile) {
        String status = profile.isQueueLocked() ? "disabled" :
                (profile.getStrikes() > 0 ? "warned" : "active");

        return AdminReviewerDto.builder()
                .id(profile.getId())
                .name(profile.getName())
                .email(profile.getUser().getEmail())
                .language(profile.getLanguage())
                .qualificationStatus(profile.isQualificationPassed() ? "passed" : "pending")
                .qualityScore(profile.getQualityScore())
                .completionRate((int) profile.getApprovalRate())
                .strikes(profile.getStrikes())
                .status(status)
                .tasksCompleted(profile.getTasksCompleted())
                .approvalRate(profile.getApprovalRate())
                .joinedAt(profile.getCreatedAt())
                .build();
    }

    private AdminCreatorDto mapCreatorToDto(CreatorProfile profile) {
        return AdminCreatorDto.builder()
                .id(profile.getId())
                .name(profile.getName())
                .email(profile.getUser().getEmail())
                .planTier(profile.getPlanTier())
                .uploadsThisMonth(0) // TODO: Calculate
                .slaIssues(0) // TODO: Calculate
                .creditsIssued(profile.getRemainingCredits())
                .joinedAt(profile.getCreatedAt())
                .build();
    }

    private PayoutDto mapPayoutToDto(Payout payout) {
        return PayoutDto.builder()
                .id(payout.getId())
                .reviewerId(payout.getReviewer().getId())
                .reviewerName(payout.getReviewer().getName())
                .amount(payout.getAmount())
                .tasksIncluded(payout.getTasksIncluded())
                .status(payout.getStatus().name().toLowerCase())
                .createdAt(payout.getCreatedAt())
                .releasedAt(payout.getReleasedAt())
                .build();
    }
}
