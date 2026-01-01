package com.contentdiagnostics.reviewers.entity;

import com.contentdiagnostics.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

/**
 * Profile entity for reviewers.
 */
@Entity
@Table(name = "reviewer_profiles", indexes = {
        @Index(name = "idx_reviewer_profiles_language", columnList = "language"),
        @Index(name = "idx_reviewer_profiles_quality_score", columnList = "quality_score")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 512)
    private String profileImageUrl;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String language = "English"; // MVP: English-only

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String proficiency = "native"; // native, fluent, intermediate

    @Column(nullable = false)
    @Builder.Default
    private boolean qualificationPassed = false;

    @Column(nullable = false)
    @Builder.Default
    private Integer qualityScore = 100; // 0-100

    @Column(nullable = false)
    @Builder.Default
    private boolean queueLocked = true; // Locked if score < 60 or not qualified

    @Column(nullable = false)
    @Builder.Default
    private Integer tasksCompleted = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer tasksApproved = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer tasksRejected = 0;

    @Column(nullable = false)
    @Builder.Default
    private Double totalEarnings = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Double pendingEarnings = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PayoutMethod payoutMethod;

    @Column(length = 255)
    private String payoutDetails; // Encrypted or reference to secure storage

    @Column(nullable = false)
    @Builder.Default
    private Integer strikes = 0;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    /**
     * Check if reviewer can access the task queue.
     */
    public boolean canAccessQueue() {
        return qualificationPassed && !queueLocked && qualityScore >= 60;
    }

    /**
     * Calculate approval rate.
     */
    public double getApprovalRate() {
        if (tasksCompleted == 0) return 0.0;
        return (double) tasksApproved / tasksCompleted * 100;
    }
}
