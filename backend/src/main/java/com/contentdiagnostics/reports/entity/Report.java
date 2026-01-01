package com.contentdiagnostics.reports.entity;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.jobs.entity.Job;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

/**
 * Entity representing a diagnostic report for a reviewed video.
 */
@Entity
@Table(name = "reports", indexes = {
        @Index(name = "idx_reports_creator_id", columnList = "creator_id"),
        @Index(name = "idx_reports_job_id", columnList = "job_id"),
        @Index(name = "idx_reports_status", columnList = "status")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false, unique = true)
    private Job job;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ReportStatus status = ReportStatus.COMPILING;

    // Video metadata
    @Column(nullable = false, length = 255)
    private String videoTitle;

    @Column(length = 20)
    private String duration;

    @Column
    private Integer videoDurationMinutes;

    @Column(nullable = false, length = 50)
    private String languagePool;

    @Column(nullable = false)
    private Integer guaranteedReviewers;

    @Column(length = 50)
    private String slaWindow;

    @Column(length = 50)
    private String actualDeliveryTime;

    // Scores (0-100)
    @Column
    private Integer clarityScore;

    @Column
    private Integer pacingScore;

    @Column
    private Integer engagementScore;

    @Column
    private Integer structureScore;

    // Report content stored as JSON
    @Column(columnDefinition = "TEXT")
    private String executiveSummary;

    @Column(columnDefinition = "TEXT")
    private String timelineInsightsJson;

    @Column(columnDefinition = "TEXT")
    private String aiAnalysisJson;

    @Column(columnDefinition = "TEXT")
    private String humanReviewsJson;

    @Column(columnDefinition = "TEXT")
    private String actionPlanJson;

    // For comparison/series tracking
    @Column(length = 100)
    private String seriesId;

    @Column
    private Integer version;

    @Column
    private Instant dateSubmitted;

    @Column
    private Instant dateCompleted;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;
}
