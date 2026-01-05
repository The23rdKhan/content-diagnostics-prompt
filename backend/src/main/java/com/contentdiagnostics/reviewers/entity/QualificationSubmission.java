package com.contentdiagnostics.reviewers.entity;

import com.contentdiagnostics.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;

/**
 * Tracks qualification test submissions for reviewers.
 */
@Entity
@Table(name = "qualification_submissions", indexes = {
        @Index(name = "idx_qualification_user", columnList = "user_id"),
        @Index(name = "idx_qualification_submitted_at", columnList = "submitted_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QualificationSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * The answers submitted by the user.
     * Key: question ID, Value: user's answer
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, String> answers;

    /**
     * Time taken to complete the test in seconds.
     */
    @Column(name = "completion_time_seconds")
    private Double completionTimeSeconds;

    /**
     * Score achieved (0.0 to 1.0).
     */
    @Column(nullable = false)
    private Double score;

    /**
     * Number of correct answers.
     */
    @Column(name = "correct_count", nullable = false)
    private Integer correctCount;

    /**
     * Total number of questions.
     */
    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    /**
     * Whether the submission passed the qualification.
     */
    @Column(nullable = false)
    private boolean passed;

    /**
     * Attempt number for this user.
     */
    @Column(name = "attempt_number", nullable = false)
    private Integer attemptNumber;

    @CreationTimestamp
    @Column(name = "submitted_at", nullable = false, updatable = false)
    private Instant submittedAt;
}
