package com.contentdiagnostics.reviewers.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.common.exception.BadRequestException;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.reviewers.dto.*;
import com.contentdiagnostics.reviewers.entity.ReviewerProfile;
import com.contentdiagnostics.reviewers.repository.ReviewerProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for reviewer operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewerService {

    private final ReviewerProfileRepository profileRepository;

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
        profile.setPayoutDetails(request.getPayoutDetails()); // TODO: Encrypt

        profile = profileRepository.save(profile);
        return mapToDto(profile, user.getEmail());
    }

    /**
     * Get earnings summary.
     */
    @Transactional(readOnly = true)
    public EarningsResponse getEarnings(User user) {
        ReviewerProfile profile = getProfileEntity(user);

        // TODO: Implement actual earnings history from tasks
        return EarningsResponse.builder()
                .totalEarnings(profile.getTotalEarnings())
                .pendingEarnings(profile.getPendingEarnings())
                .availableForPayout(profile.getPendingEarnings())
                .tasksCompletedThisMonth(0)
                .earningsThisMonth(0.0)
                .recentEarnings(List.of())
                .build();
    }

    // --- Helper methods ---

    private ReviewerProfile getProfileEntity(User user) {
        return profileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer profile", user.getId().toString()));
    }

    private boolean evaluateQualification(QualificationSubmissionRequest request) {
        // TODO: Implement proper qualification evaluation
        // For MVP: pass if answers provided and completion time is reasonable
        return request.getAnswers() != null
                && !request.getAnswers().isEmpty()
                && (request.getCompletionTimeSeconds() == null || request.getCompletionTimeSeconds() >= 30);
    }

    private ReviewerProfileDto mapToDto(ReviewerProfile profile, String email) {
        return ReviewerProfileDto.builder()
                .id(profile.getId())
                .name(profile.getName())
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
