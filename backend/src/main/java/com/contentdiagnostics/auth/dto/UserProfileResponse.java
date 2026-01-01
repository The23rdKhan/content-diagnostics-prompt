package com.contentdiagnostics.auth.dto;

import com.contentdiagnostics.auth.entity.UserRole;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * Response DTO for user profile (GET /api/auth/me).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserProfileResponse {

    private Long id;
    private String email;
    private UserRole role;
    private boolean emailVerified;
    private Instant createdAt;
    private Instant lastLoginAt;

    // Role-specific profiles
    private CreatorProfile creatorProfile;
    private ReviewerProfile reviewerProfile;
    private AdminProfile adminProfile;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatorProfile {
        private String name;
        private String company;
        private String profileImageUrl;
        private String bannerImageUrl;
        private String primaryLanguage;
        private String planTier;
        private Integer remainingCredits;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewerProfile {
        private String name;
        private String profileImageUrl;
        private String language;
        private String proficiency;
        private boolean qualificationPassed;
        private Integer qualityScore;
        private boolean queueLocked;
        private Integer tasksCompleted;
        private Double totalEarnings;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminProfile {
        private String name;
        private List<String> permissions;
    }
}
