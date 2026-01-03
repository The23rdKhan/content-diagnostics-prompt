package com.contentdiagnostics.reviewers.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.common.exception.BadRequestException;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.reviewers.config.QualificationConfig;
import com.contentdiagnostics.reviewers.dto.*;
import com.contentdiagnostics.reviewers.entity.ReviewerProfile;
import com.contentdiagnostics.reviewers.repository.ReviewerProfileRepository;
import com.contentdiagnostics.tasks.repository.TaskRepository;
import com.contentdiagnostics.common.service.EncryptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for reviewer operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewerService {

    private final ReviewerProfileRepository profileRepository;
    private final TaskRepository taskRepository;
    private final QualificationConfig qualificationConfig;
    private final EncryptionService encryptionService;

    /**
     * Get reviewer profile.
     */
    @Transactional(readOnly = true)
    public ReviewerProfileDto getProfile(User user) {
        ReviewerProfile profile = getProfileEntity(user);
        return mapToDto(profile, user.getEmail());
    }

    /**
     * Update reviewer profile.
     */
    @Transactional
    public ReviewerProfileDto updateProfile(User user, UpdateReviewerProfileRequest request) {
        ReviewerProfile profile = getProfileEntity(user);

        if (request.getName() != null) {
            profile.setName(request.getName());
            // Parse name into firstName and lastName
            String[] parts = request.getName().trim().split("\\s+", 2);
            profile.setFirstName(parts[0]);
            profile.setLastName(parts.length > 1 ? parts[1] : "");
        }
        if (request.getProfileImageUrl() != null) {
            profile.setProfileImageUrl(request.getProfileImageUrl());
        }
        if (request.getProficiency() != null) {
            profile.setProficiency(request.getProficiency());
        }

        profile = profileRepository.save(profile);
        return mapToDto(profile, user.getEmail());
    }

    /**
     * Submit qualification test.
     */
    @Transactional
    public ReviewerProfileDto submitQualification(User user, QualificationSubmissionRequest request) {
        ReviewerProfile profile = getProfileEntity(user);

        if (profile.isQualificationPassed()) {
            throw new BadRequestException("Qualification already passed");
        }

        // TODO: Implement actual qualification test logic
        // For MVP, automatically pass if submission is received
        boolean passed = evaluateQualification(request);

        if (passed) {
            profileRepository.passQualification(profile.getId());
            profile.setQualificationPassed(true);
            profile.setQueueLocked(false);
            log.info("Reviewer {} passed qualification", user.getId());
        } else {
            log.info("Reviewer {} failed qualification", user.getId());
            throw new BadRequestException("Qualification test not passed. Please try again.");
        }

        return mapToDto(profile, user.getEmail());
    }

    /**
     * Update payout method.
     */
    @Transactional
    public ReviewerProfileDto updatePayoutMethod(User user, UpdatePayoutMethodRequest request) {
        ReviewerProfile profile = getProfileEntity(user);

        profile.setPayoutMethod(request.getPayoutMethod());
        // Encrypt sensitive payout details before storing
        String encryptedDetails = encryptionService.encrypt(request.getPayoutDetails());
        profile.setPayoutDetails(encryptedDetails);

        profile = profileRepository.save(profile);
        return mapToDto(profile, user.getEmail());
    }

    /**
     * Get earnings summary.
     */
    @Transactional(readOnly = true)
    public EarningsResponse getEarnings(User user) {
        ReviewerProfile profile = getProfileEntity(user);

        // Calculate start of current month
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        Instant monthStart = startOfMonth.atStartOfDay(ZoneOffset.UTC).toInstant();

        // Get monthly stats from completed tasks
        int tasksThisMonth = taskRepository.countApprovedByReviewerSince(profile, monthStart);
        double earningsThisMonth = taskRepository.sumPayAmountByReviewerSince(profile, monthStart);

        // Get daily breakdown for the last 30 days
        Instant thirtyDaysAgo = Instant.now().minusSeconds(30 * 24 * 60 * 60);
        List<Object[]> dailyBreakdown = taskRepository.getDailyEarningsBreakdown(profile, thirtyDaysAgo);

        List<EarningsResponse.EarningsBreakdown> recentEarnings = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (Object[] row : dailyBreakdown) {
            Object dateObj = row[0];
            Long count = (Long) row[1];
            Double amount = (Double) row[2];

            String dateStr;
            if (dateObj instanceof java.sql.Date sqlDate) {
                dateStr = sqlDate.toLocalDate().format(formatter);
            } else if (dateObj instanceof LocalDate ld) {
                dateStr = ld.format(formatter);
            } else {
                dateStr = dateObj.toString();
            }

            recentEarnings.add(EarningsResponse.EarningsBreakdown.builder()
                    .date(dateStr)
                    .tasksCompleted(count.intValue())
                    .amount(amount)
                    .build());
        }

        return EarningsResponse.builder()
                .totalEarnings(profile.getTotalEarnings())
                .pendingEarnings(profile.getPendingEarnings())
                .availableForPayout(profile.getPendingEarnings())
                .tasksCompletedThisMonth(tasksThisMonth)
                .earningsThisMonth(earningsThisMonth)
                .recentEarnings(recentEarnings)
                .build();
    }

    // --- Helper methods ---

    private ReviewerProfile getProfileEntity(User user) {
        return profileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer profile", user.getId().toString()));
    }

    private boolean evaluateQualification(QualificationSubmissionRequest request) {
        if (request.getAnswers() == null || request.getAnswers().isEmpty()) {
            log.warn("Qualification submission has no answers");
            return false;
        }

        boolean passed = qualificationConfig.evaluate(
                request.getAnswers(),
                request.getCompletionTimeSeconds()
        );

        log.info("Qualification evaluation: passed={}, completionTime={}s, answersCount={}",
                passed, request.getCompletionTimeSeconds(), request.getAnswers().size());

        return passed;
    }

    private ReviewerProfileDto mapToDto(ReviewerProfile profile, String email) {
        return ReviewerProfileDto.builder()
                .id(profile.getId())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .displayName(profile.getDisplayName())
                .email(email)
                .profileImageUrl(profile.getProfileImageUrl())
                .language(profile.getLanguage())
                .proficiency(profile.getProficiency())
                .qualificationPassed(profile.isQualificationPassed())
                .qualityScore(profile.getQualityScore())
                .queueLocked(profile.isQueueLocked())
                .tasksCompleted(profile.getTasksCompleted())
                .tasksApproved(profile.getTasksApproved())
                .tasksRejected(profile.getTasksRejected())
                .approvalRate(profile.getApprovalRate())
                .totalEarnings(profile.getTotalEarnings())
                .pendingEarnings(profile.getPendingEarnings())
                .payoutMethod(profile.getPayoutMethod())
                .strikes(profile.getStrikes())
                .createdAt(profile.getCreatedAt())
                .build();
    }
}
