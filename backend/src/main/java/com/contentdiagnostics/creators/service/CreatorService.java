package com.contentdiagnostics.creators.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.creators.dto.CreatorProfileDto;
import com.contentdiagnostics.creators.dto.PlanDto;
import com.contentdiagnostics.creators.dto.SubscriptionDto;
import com.contentdiagnostics.creators.dto.UpdateCreatorProfileRequest;
import com.contentdiagnostics.creators.entity.CreatorProfile;
import com.contentdiagnostics.creators.repository.CreatorProfileRepository;
import com.contentdiagnostics.credits.service.CreditService;
import com.contentdiagnostics.jobs.repository.JobRepository;
import com.contentdiagnostics.plans.service.PlanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for creator profile operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CreatorService {

    private final CreatorProfileRepository creatorProfileRepository;
    private final CreditService creditService;
    private final PlanService planService;
    private final JobRepository jobRepository;

    /**
     * Get profile for the current user.
     */
    @Transactional(readOnly = true)
    public CreatorProfileDto getProfile(User user) {
        CreatorProfile profile = creatorProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Creator profile not found"));

        return toDto(profile);
    }

    /**
     * Get profile by ID.
     */
    @Transactional(readOnly = true)
    public CreatorProfileDto getProfileById(Long profileId) {
        CreatorProfile profile = creatorProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Creator profile not found"));

        return toDto(profile);
    }

    /**
     * Update creator profile.
     */
    @Transactional
    public CreatorProfileDto updateProfile(User user, UpdateCreatorProfileRequest request) {
        CreatorProfile profile = creatorProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Creator profile not found"));

        if (request.getName() != null) {
            profile.setName(request.getName());
            // Parse name into firstName and lastName
            String[] parts = request.getName().trim().split("\\s+", 2);
            profile.setFirstName(parts[0]);
            profile.setLastName(parts.length > 1 ? parts[1] : "");
        }
        if (request.getCompany() != null) {
            profile.setCompany(request.getCompany());
        }
        if (request.getProfileImageUrl() != null) {
            profile.setProfileImageUrl(request.getProfileImageUrl());
        }
        if (request.getBannerImageUrl() != null) {
            profile.setBannerImageUrl(request.getBannerImageUrl());
        }
        if (request.getPrimaryLanguage() != null) {
            profile.setPrimaryLanguage(request.getPrimaryLanguage());
        }

        CreatorProfile saved = creatorProfileRepository.save(profile);
        log.info("Updated creator profile for user: {}", user.getEmail());

        return toDto(saved);
    }

    /**
     * Get or create creator profile for a user.
     */
    @Transactional
    public CreatorProfile getOrCreateProfile(User user) {
        return creatorProfileRepository.findByUser(user)
                .orElseGet(() -> {
                    CreatorProfile newProfile = CreatorProfile.builder()
                            .user(user)
                            .name(user.getEmail().split("@")[0])
                            .build();
                    log.info("Created new creator profile for user: {}", user.getEmail());
                    return creatorProfileRepository.save(newProfile);
                });
    }

    /**
     * Add credits to creator profile.
     */
    @Transactional
    public void addCredits(Long profileId, int credits) {
        int updated = creatorProfileRepository.addCredits(profileId, credits);
        if (updated == 0) {
            throw new ResourceNotFoundException("Creator profile not found");
        }
        log.info("Added {} credits to profile {}", credits, profileId);
    }

    /**
     * Deduct credits from creator profile.
     */
    @Transactional
    public boolean deductCredits(Long profileId, int credits) {
        int updated = creatorProfileRepository.deductCredits(profileId, credits);
        if (updated > 0) {
            log.info("Deducted {} credits from profile {}", credits, profileId);
            return true;
        }
        return false;
    }

    /**
     * Update subscription details.
     */
    @Transactional
    public void updateSubscription(Long profileId, String customerId, String subscriptionId, String planTier) {
        int updated = creatorProfileRepository.updateSubscription(profileId, customerId, subscriptionId, planTier);
        if (updated == 0) {
            throw new ResourceNotFoundException("Creator profile not found");
        }
        log.info("Updated subscription for profile {}: plan={}", profileId, planTier);
    }

    /**
     * Get creator profile entity by user.
     */
    @Transactional(readOnly = true)
    public CreatorProfile getProfileEntity(User user) {
        return creatorProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Creator profile not found"));
    }

    /**
     * Get available subscription plans.
     */
    public List<PlanDto> getAvailablePlans() {
        return planService.getActivePlans().stream()
                .map(plan -> PlanDto.builder()
                        .id(plan.getTierCode())
                        .name(plan.getDisplayName())
                        .description(plan.getDescription())
                        .price(plan.getMonthlyPrice())
                        .priceDisplay(plan.getPriceDisplay())
                        .billingPeriod("month")
                        .reviewersPerVideo(plan.getReviewersPerVideo())
                        .videosPerMonth(plan.getVideosPerMonth())
                        .features(plan.getFeatures())
                        .popular(plan.getPopular())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Get subscription details for a user.
     */
    @Transactional(readOnly = true)
    public SubscriptionDto getSubscription(User user) {
        CreatorProfile profile = creatorProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Creator profile not found"));

        String planTier = profile.getPlanTier() != null ? profile.getPlanTier() : "basic";
        PlanDto plan = getAvailablePlans().stream()
                .filter(p -> p.getId().equals(planTier))
                .findFirst()
                .orElse(getAvailablePlans().get(0));

        boolean hasSubscription = profile.getStripeSubscriptionId() != null;
        Instant periodStart = Instant.now().minus(30, ChronoUnit.DAYS);
        Instant periodEnd = Instant.now();

        // Calculate videos submitted this billing period
        long videosThisMonth = jobRepository.countByCreatorSince(user, periodStart);

        return SubscriptionDto.builder()
                .planId(plan.getId())
                .planName(plan.getName())
                .status(hasSubscription ? "active" : "inactive")
                .monthlyPrice(plan.getPrice())
                .billingPeriod(plan.getBillingPeriod())
                .currentPeriodStart(periodStart)
                .currentPeriodEnd(periodEnd)
                .remainingCredits(profile.getRemainingCredits())
                .videosThisMonth((int) videosThisMonth)
                .videosLimit(plan.getVideosPerMonth())
                .cancelAtPeriodEnd(false)
                .stripeCustomerId(profile.getStripeCustomerId())
                .stripeSubscriptionId(profile.getStripeSubscriptionId())
                .build();
    }

    /**
     * Activate a subscription (mock mode for development).
     * In production, this would be called by the Stripe webhook.
     */
    @Transactional
    public SubscriptionDto activateSubscription(User user, String planTier) {
        CreatorProfile profile = creatorProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Creator profile not found"));

        // Update the profile with mock subscription data
        profile.setPlanTier(planTier);
        profile.setStripeCustomerId("mock_cus_" + user.getId());
        profile.setStripeSubscriptionId("mock_sub_" + System.currentTimeMillis());
        creatorProfileRepository.save(profile);
        creditService.addSubscriptionCredits(profile, planTier, "mock_subscription_" + System.currentTimeMillis());
        log.info("Activated mock subscription for user {}: plan={}", user.getId(), planTier);

        return getSubscription(user);
    }

    /**
     * Convert entity to DTO.
     */
    private CreatorProfileDto toDto(CreatorProfile profile) {
        return CreatorProfileDto.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .email(profile.getUser().getEmail())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .displayName(profile.getDisplayName())
                .company(profile.getCompany())
                .profileImageUrl(profile.getProfileImageUrl())
                .bannerImageUrl(profile.getBannerImageUrl())
                .primaryLanguage(profile.getPrimaryLanguage())
                .planTier(profile.getPlanTier())
                .remainingCredits(profile.getRemainingCredits())
                .hasStripeSubscription(profile.getStripeSubscriptionId() != null)
                .createdAt(profile.getCreatedAt())
                .build();
    }
}
