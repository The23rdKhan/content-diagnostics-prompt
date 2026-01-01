package com.contentdiagnostics.tasks.entity;

import com.contentdiagnostics.jobs.entity.Job;
import com.contentdiagnostics.reviewers.entity.ReviewerProfile;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

/**
 * Entity representing a review task for a video segment.
 * Tasks are assigned to reviewers who provide feedback.
 */
@Entity
@Table(name = "tasks", indexes = {
        @Index(name = "idx_tasks_job_id", columnList = "job_id"),
        @Index(name = "idx_tasks_reviewer_id", columnList = "reviewer_id"),
        @Index(name = "idx_tasks_status", columnList = "status"),
        @Index(name = "idx_tasks_language_status", columnList = "language, status")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id")
    private ReviewerProfile reviewer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TaskStatus status = TaskStatus.AVAILABLE;

    @Column(nullable = false, length = 50)
    private String language;

    @Column(length = 50)
    private String segmentTimestamp; // e.g., "0:00-2:30"

    @Column
    private Integer segmentStartSeconds;

    @Column
    private Integer segmentEndSeconds;

    @Column(nullable = false)
    @Builder.Default
    private Double payAmount = 0.30;

    @Column(length = 512)
    private String videoSegmentUrl;

    @Column(columnDefinition = "TEXT")
    private String questionsJson; // JSON array of questions

    @Column
    private Integer attentionCheckIndex;

    // Lease management
    @Column
    private Instant leaseExpiresAt;

    @Column
    private Integer leaseVersion; // For optimistic locking

    // Submission data
    @Column
    private Instant submittedAt;

    @Column(columnDefinition = "TEXT")
    private String answersJson; // JSON object of answers

    @Column
    private Double watchRatio; // Percentage of video watched

    @Column
    private Integer completionTimeSeconds;

    // QC data
    @Column
    private Instant reviewedAt;

    @Column(length = 500)
    private String rejectionReason;

    @Column
    private Boolean attentionCheckPassed;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    /**
     * Check if lease has expired.
     */
    public boolean isLeaseExpired() {
        return leaseExpiresAt != null && Instant.now().isAfter(leaseExpiresAt);
    }

    /**
     * Get segment duration in seconds.
     */
    public int getSegmentDuration() {
        if (segmentStartSeconds != null && segmentEndSeconds != null) {
            return segmentEndSeconds - segmentStartSeconds;
        }
        return 0;
    }
}
