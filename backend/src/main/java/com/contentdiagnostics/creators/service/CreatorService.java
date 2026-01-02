package com.contentdiagnostics.creators.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.creators.dto.CreatorProfileDto;
import com.contentdiagnostics.creators.dto.UpdateCreatorProfileRequest;
import com.contentdiagnostics.creators.entity.CreatorProfile;
import com.contentdiagnostics.creators.repository.CreatorProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for creator profile operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CreatorService {

    private final CreatorProfileRepository creatorProfileRepository;

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
