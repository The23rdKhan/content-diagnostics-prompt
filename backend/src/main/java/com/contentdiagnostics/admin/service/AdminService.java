package com.contentdiagnostics.admin.service;

import com.contentdiagnostics.admin.dto.*;
import com.contentdiagnostics.admin.entity.LanguagePoolSettings;
import com.contentdiagnostics.admin.repository.LanguagePoolSettingsRepository;
import com.contentdiagnostics.audit.service.AuditService;
import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.auth.entity.UserRole;
import com.contentdiagnostics.auth.repository.UserRepository;
import com.contentdiagnostics.common.dto.PagedResponse;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.common.util.SecurityUtils;
import com.contentdiagnostics.creators.entity.CreatorProfile;
import com.contentdiagnostics.creators.repository.CreatorProfileRepository;
import com.contentdiagnostics.credits.entity.CreditTransactionType;
import com.contentdiagnostics.credits.service.CreditService;
import com.contentdiagnostics.jobs.entity.JobStatus;
import com.contentdiagnostics.jobs.repository.JobRepository;
import com.contentdiagnostics.notifications.dto.EmailLogDto;
import com.contentdiagnostics.notifications.dto.EmailStatsDto;
import com.contentdiagnostics.notifications.entity.EmailLog;
import com.contentdiagnostics.notifications.entity.EmailLog.EmailStatus;
import com.contentdiagnostics.notifications.entity.NotificationType;
import com.contentdiagnostics.notifications.repository.EmailLogRepository;
import com.contentdiagnostics.payouts.dto.PayoutDto;
import com.contentdiagnostics.payouts.entity.Payout;
import com.contentdiagnostics.payouts.entity.PayoutStatus;
import com.contentdiagnostics.payouts.repository.PayoutRepository;
import com.contentdiagnostics.reviewers.entity.ReviewerProfile;
import com.contentdiagnostics.reviewers.repository.ReviewerProfileRepository;
import com.contentdiagnostics.tasks.dto.TaskDto;
import com.contentdiagnostics.tasks.entity.Task;
import com.contentdiagnostics.tasks.entity.TaskStatus;
import com.contentdiagnostics.tasks.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Arrays;
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
    private final LanguagePoolSettingsRepository languagePoolSettingsRepository;
    private final EmailLogRepository emailLogRepository;

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

        // Calculate daily stats
        Instant startOfToday = LocalDate.now(ZoneId.of("UTC"))
                .atStartOfDay(ZoneId.of("UTC"))
                .toInstant();

        long tasksCompletedToday = taskRepository.countApprovedSince(startOfToday);
        long jobsDeliveredToday = jobRepository.countDeliveredSince(startOfToday);

        // Calculate average delivery time (last 30 days)
        Instant thirtyDaysAgo = Instant.now().minus(30, java.time.temporal.ChronoUnit.DAYS);
        Double avgDeliveryTime = jobRepository.getAverageDeliveryTime(thirtyDaysAgo);

        // Calculate SLA compliance rate (last 30 days)
        long onTimeDeliveries = jobRepository.countOnTimeDeliveries(thirtyDaysAgo);
        long totalDelivered = jobRepository.countTotalDeliveredSince(thirtyDaysAgo);
        double slaComplianceRate = totalDelivered > 0
                ? (double) onTimeDeliveries / totalDelivered
                : 1.0; // Default to 100% if no deliveries yet

        return KpiResponse.builder()
                .totalCreators(totalCreators)
                .totalReviewers(totalReviewers)
                .activeReviewers(activeReviewers)
                .pendingTasks(pendingTasks)
                .tasksCompletedToday(tasksCompletedToday)
                .jobsInProgress(jobsInProgress)
                .jobsDeliveredToday(jobsDeliveredToday)
                .avgDeliveryTimeHours(avgDeliveryTime != null ? avgDeliveryTime : 0.0)
                .slaComplianceRate(slaComplianceRate)
                .build();
    }

    /**
     * Get capacity overview for all language pools.
     */
    @Transactional(readOnly = true)
    public CapacityResponse getCapacity() {
        List<LanguagePoolSettings> settings = languagePoolSettingsRepository.findByActiveTrueOrderByDisplayNameAsc();

        List<CapacityResponse.LanguagePoolCapacity> pools = settings.stream()
                .map(this::mapToCapacityDto)
                .collect(Collectors.toList());

        return CapacityResponse.builder()
                .languagePools(pools)
                .build();
    }

    /**
     * Update capacity settings for a language pool.
     */
    @Transactional
    public CapacityResponse.LanguagePoolCapacity updateCapacity(String languageCode, UpdateCapacityRequest request) {
        User admin = SecurityUtils.getCurrentUser();
        LanguagePoolSettings settings = languagePoolSettingsRepository.findByLanguageCode(languageCode)
                .orElseThrow(() -> new ResourceNotFoundException("Language pool", languageCode));

        // Capture old values for audit
        Map<String, Object> oldValues = new HashMap<>();
        oldValues.put("currentSla", settings.getCurrentSla());
        oldValues.put("maxReviewersPerVideo", settings.getMaxReviewersPerVideo());
        oldValues.put("checkoutEnabled", settings.getCheckoutEnabled());
        oldValues.put("liveAddonEnabled", settings.getLiveAddonEnabled());

        // Apply updates
        if (request.getCurrentSLA() != null) {
            settings.setCurrentSla(request.getCurrentSLA());
        }
        if (request.getMaxReviewersPerVideo() != null) {
            settings.setMaxReviewersPerVideo(request.getMaxReviewersPerVideo());
        }
        if (request.getCheckoutEnabled() != null) {
            settings.setCheckoutEnabled(request.getCheckoutEnabled());
        }
        if (request.getLiveAddOnEnabled() != null) {
            settings.setLiveAddonEnabled(request.getLiveAddOnEnabled());
        }

        settings = languagePoolSettingsRepository.save(settings);

        // Capture new values for audit
        Map<String, Object> newValues = new HashMap<>();
        newValues.put("currentSla", settings.getCurrentSla());
        newValues.put("maxReviewersPerVideo", settings.getMaxReviewersPerVideo());
        newValues.put("checkoutEnabled", settings.getCheckoutEnabled());
        newValues.put("liveAddonEnabled", settings.getLiveAddonEnabled());

        // Audit log the change
        auditService.recordAdminAction(
                admin,
                "CAPACITY_UPDATE",
                "LANGUAGE_POOL",
                settings.getId(),
                String.format("Updated capacity for %s", settings.getDisplayName()),
                oldValues,
                newValues
        );

        log.info("Admin updated capacity for language pool {}", languageCode);

        return mapToCapacityDto(settings);
    }

    private CapacityResponse.LanguagePoolCapacity mapToCapacityDto(LanguagePoolSettings settings) {
        // Get live stats for this language
        String languageName = settings.getDisplayName().contains("(")
                ? settings.getDisplayName().substring(0, settings.getDisplayName().indexOf("(")).trim()
                : settings.getDisplayName();
        long activeReviewers = reviewerProfileRepository.countActiveByLanguage(languageName);
        long pendingTasks = jobRepository.countActiveByLanguage(languageName);

        // Calculate capacity score (0-100) based on reviewer availability
        int capacityScore = calculateCapacityScore(activeReviewers, pendingTasks);

        return CapacityResponse.LanguagePoolCapacity.builder()
                .id(settings.getId().toString())
                .name(settings.getDisplayName())
                .code(settings.getLanguageCode())
                .capacityScore(capacityScore)
                .currentSLA(settings.getCurrentSla())
                .maxReviewersPerVideo(settings.getMaxReviewersPerVideo())
                .checkoutEnabled(settings.getCheckoutEnabled())
                .liveAddOnEnabled(settings.getLiveAddonEnabled())
                .activeReviewers(activeReviewers)
                .pendingTasks(pendingTasks)
                .avgDeliveryTime(calculateAvgDeliveryTime(settings.getCurrentSla()))
                .build();
    }

    private int calculateCapacityScore(long activeReviewers, long pendingTasks) {
        if (activeReviewers == 0) return 0;
        if (pendingTasks == 0) return 100;
        // Simple ratio-based score
        double ratio = (double) activeReviewers / Math.max(pendingTasks, 1);
        return (int) Math.min(100, Math.max(0, ratio * 50));
    }

    private String calculateAvgDeliveryTime(String sla) {
        // Estimate avg delivery as ~75% of SLA
        return switch (sla) {
            case "24h" -> "18h";
            case "48h" -> "36h";
            case "72h" -> "54h";
            default -> "24h";
        };
    }

    /**
     * Get all tasks for admin view.
     */
    @Transactional(readOnly = true)
    public List<TaskDto> getTasks(int page, int size) {
        Page<Task> tasks = taskRepository.findAll(PageRequest.of(page, size));
        return tasks.stream().map(this::mapTaskToDto).collect(Collectors.toList());
    }

    private TaskDto mapTaskToDto(Task task) {
        return TaskDto.builder()
                .id(task.getId())
                .status(task.getStatus())
                .language(task.getLanguage())
                .segmentTimestamp(task.getSegmentTimestamp())
                .segmentDurationSeconds(task.getSegmentDuration())
                .payAmount(task.getPayAmount())
                .videoSegmentUrl(task.getVideoSegmentUrl())
                .leaseExpiresAt(task.getLeaseExpiresAt())
                .submittedAt(task.getSubmittedAt())
                .reviewedAt(task.getReviewedAt())
                .rejectionReason(task.getRejectionReason())
                .createdAt(task.getCreatedAt())
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

    // ==================== Email Log Methods ====================

    /**
     * Get email statistics for the dashboard.
     */
    @Transactional(readOnly = true)
    public EmailStatsDto getEmailStats() {
        long totalSent = emailLogRepository.countByStatus(EmailStatus.SENT);
        long totalFailed = emailLogRepository.countByStatus(EmailStatus.FAILED);
        long totalSkipped = emailLogRepository.countByStatus(EmailStatus.SKIPPED);

        // Get today's start in UTC
        Instant todayStart = LocalDate.now(ZoneId.of("UTC"))
                .atStartOfDay(ZoneId.of("UTC"))
                .toInstant();

        long sentToday = emailLogRepository.countSentToday(todayStart);
        long failedToday = emailLogRepository.countFailedToday(todayStart);

        // Calculate delivery rate
        long totalAttempted = totalSent + totalFailed;
        double deliveryRate = totalAttempted > 0 ? (double) totalSent / totalAttempted * 100 : 100.0;

        // Get breakdown by notification type
        Map<String, Long> byType = Arrays.stream(NotificationType.values())
                .collect(Collectors.toMap(
                        NotificationType::name,
                        type -> emailLogRepository.countByNotificationType(type)
                ));

        // Get breakdown by status
        Map<String, Long> byStatus = Arrays.stream(EmailStatus.values())
                .collect(Collectors.toMap(
                        EmailStatus::name,
                        emailLogRepository::countByStatus
                ));

        return EmailStatsDto.builder()
                .totalSent(totalSent)
                .totalFailed(totalFailed)
                .totalSkipped(totalSkipped)
                .sentToday(sentToday)
                .failedToday(failedToday)
                .deliveryRate(deliveryRate)
                .byType(byType)
                .byStatus(byStatus)
                .build();
    }

    /**
     * Get email logs with optional filters.
     */
    @Transactional(readOnly = true)
    public PagedResponse<EmailLogDto> getEmailLogs(int page, int size,
                                                    EmailStatus status,
                                                    NotificationType type,
                                                    String email) {
        Page<EmailLog> logs = emailLogRepository.searchEmails(status, type, email, PageRequest.of(page, size));

        List<EmailLogDto> content = logs.getContent().stream()
                .map(EmailLogDto::fromEntity)
                .collect(Collectors.toList());

        return PagedResponse.<EmailLogDto>builder()
                .content(content)
                .page(logs.getNumber())
                .size(logs.getSize())
                .totalElements(logs.getTotalElements())
                .totalPages(logs.getTotalPages())
                .last(logs.isLast())
                .build();
    }

    /**
     * Get a single email log by ID.
     */
    @Transactional(readOnly = true)
    public EmailLogDto getEmailLog(Long id) {
        EmailLog log = emailLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EmailLog", id.toString()));
        return EmailLogDto.fromEntity(log);
    }
}
