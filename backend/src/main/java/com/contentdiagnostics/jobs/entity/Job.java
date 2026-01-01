package com.contentdiagnostics.jobs.entity;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.videos.entity.Video;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

/**
 * Entity representing a review job for a video.
 * A job tracks the entire review pipeline from submission to report delivery.
 */
@Entity
@Table(name = "jobs", indexes = {
        @Index(name = "idx_jobs_creator_id", columnList = "creator_id"),
        @Index(name = "idx_jobs_video_id", columnList = "video_id"),
        @Index(name = "idx_jobs_status", columnList = "status")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", nullable = false)
    private Video video;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private JobStatus status = JobStatus.UPLOADING;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String language = "English";

    @Column(nullable = false)
    @Builder.Default
    private Integer slaHours = 48;

    @Column(nullable = false)
    @Builder.Default
    private Integer requiredReviewers = 50;

    @Column(nullable = false)
    @Builder.Default
    private Integer completedReviewers = 0;

    // Add-ons
    @Column
    private Integer extraReviewers;

    @Column(nullable = false)
    @Builder.Default
    private Boolean fasterDelivery = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean fullWatchSummary = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean liveFeedback = false;

    // Timeline tracking
    @Column(nullable = false)
    @Builder.Default
    private Boolean aiDiagnosticsComplete = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean humanReviewComplete = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean reportCompiled = false;

    @Column
    private Instant slaDeadline;

    @Column
    private Instant deliveredAt;

    @Column
    private Integer deliveryTimeHours;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    /**
     * Calculate total required reviewers including add-ons.
     */
    public int getTotalRequiredReviewers() {
        return requiredReviewers + (extraReviewers != null ? extraReviewers : 0);
    }

    /**
     * Check if SLA is at risk.
     */
    public boolean isSlaAtRisk() {
        if (slaDeadline == null || status == JobStatus.DELIVERED) {
            return false;
        }
        // At risk if less than 25% of SLA time remaining and not near completion
        Instant now = Instant.now();
        long totalMs = slaDeadline.toEpochMilli() - createdAt.toEpochMilli();
        long remainingMs = slaDeadline.toEpochMilli() - now.toEpochMilli();
        double progress = (double) completedReviewers / getTotalRequiredReviewers();

        return remainingMs < totalMs * 0.25 && progress < 0.75;
    }
}
