package com.contentdiagnostics.creators.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO for creator profile responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatorProfileDto {

    private Long id;
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String displayName;
    private String company;
    private String profileImageUrl;
    private String bannerImageUrl;
    private String primaryLanguage;
    private String planTier;
    private Integer remainingCredits;
    private Boolean hasStripeSubscription;
    private Instant createdAt;
}
