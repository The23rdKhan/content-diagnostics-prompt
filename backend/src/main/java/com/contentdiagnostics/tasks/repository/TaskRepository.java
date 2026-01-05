package com.contentdiagnostics.tasks.repository;

import com.contentdiagnostics.jobs.entity.Job;
import com.contentdiagnostics.reviewers.entity.ReviewerProfile;
import com.contentdiagnostics.tasks.entity.Task;
import com.contentdiagnostics.tasks.entity.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Task entities.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Find available tasks for a language.
     */
    @Query("SELECT t FROM Task t WHERE t.language = :language AND t.status = 'AVAILABLE' " +
            "ORDER BY t.createdAt ASC")
    List<Task> findAvailableByLanguage(@Param("language") String language, Pageable pageable);

    /**
     * Find all available tasks.
     */
    List<Task> findByStatusOrderByCreatedAtAsc(TaskStatus status);

    /**
     * Find tasks by job.
     */
    List<Task> findByJob(Job job);

    /**
     * Find tasks by reviewer.
     */
    Page<Task> findByReviewer(ReviewerProfile reviewer, Pageable pageable);

    /**
     * Find tasks by reviewer and status.
     */
    List<Task> findByReviewerAndStatus(ReviewerProfile reviewer, TaskStatus status);

    /**
     * Find task by ID and reviewer (for authorization).
     */
    Optional<Task> findByIdAndReviewer(Long id, ReviewerProfile reviewer);

    /**
     * Atomic task lease operation - only succeeds if task is AVAILABLE.
     * Uses optimistic locking with version check.
     */
    @Modifying
    @Query("UPDATE Task t SET t.status = 'LEASED', t.reviewer = :reviewer, " +
            "t.leaseExpiresAt = :expiresAt, t.leaseVersion = COALESCE(t.leaseVersion, 0) + 1 " +
            "WHERE t.id = :taskId AND t.status = 'AVAILABLE'")
    int leaseTask(@Param("taskId") Long taskId,
                  @Param("reviewer") ReviewerProfile reviewer,
                  @Param("expiresAt") Instant expiresAt);

    /**
     * Find expired leases for requeue.
     */
    @Query("SELECT t FROM Task t WHERE t.status = 'LEASED' AND t.leaseExpiresAt < :now")
    List<Task> findExpiredLeases(@Param("now") Instant now);

    /**
     * Requeue expired leases.
     */
    @Modifying
    @Query("UPDATE Task t SET t.status = 'REQUEUED', t.reviewer = null, " +
            "t.leaseExpiresAt = null WHERE t.status = 'LEASED' AND t.leaseExpiresAt < :now")
    int requeueExpiredLeases(@Param("now") Instant now);

    /**
     * Release a leased task (reviewer gives up the task).
     * Only succeeds if the task is currently leased by the specified reviewer.
     */
    @Modifying
    @Query("UPDATE Task t SET t.status = 'AVAILABLE', t.reviewer = null, " +
            "t.leaseExpiresAt = null, t.leaseVersion = COALESCE(t.leaseVersion, 0) + 1 " +
            "WHERE t.id = :taskId AND t.reviewer.id = :reviewerId AND t.status = 'LEASED'")
    int releaseTask(@Param("taskId") Long taskId, @Param("reviewerId") Long reviewerId);

    /**
     * Make requeued tasks available again.
     */
    @Modifying
    @Query("UPDATE Task t SET t.status = 'AVAILABLE' WHERE t.status = 'REQUEUED'")
    int makeRequeuedAvailable();

    /**
     * Update task to submitted status.
     */
    @Modifying
    @Query("UPDATE Task t SET t.status = 'SUBMITTED', t.submittedAt = :submittedAt, " +
            "t.answersJson = :answers, t.watchRatio = :watchRatio, " +
            "t.completionTimeSeconds = :completionTime " +
            "WHERE t.id = :taskId AND t.reviewer.id = :reviewerId AND t.status IN ('LEASED', 'IN_PROGRESS')")
    int submitTask(@Param("taskId") Long taskId,
                   @Param("reviewerId") Long reviewerId,
                   @Param("submittedAt") Instant submittedAt,
                   @Param("answers") String answers,
                   @Param("watchRatio") Double watchRatio,
                   @Param("completionTime") Integer completionTime);

    /**
     * Approve task.
     */
    @Modifying
    @Query("UPDATE Task t SET t.status = 'APPROVED', t.reviewedAt = :reviewedAt, " +
            "t.attentionCheckPassed = :passed WHERE t.id = :taskId")
    int approveTask(@Param("taskId") Long taskId,
                    @Param("reviewedAt") Instant reviewedAt,
                    @Param("passed") boolean passed);

    /**
     * Reject task.
     */
    @Modifying
    @Query("UPDATE Task t SET t.status = 'REJECTED', t.reviewedAt = :reviewedAt, " +
            "t.rejectionReason = :reason, t.attentionCheckPassed = :passed WHERE t.id = :taskId")
    int rejectTask(@Param("taskId") Long taskId,
                   @Param("reviewedAt") Instant reviewedAt,
                   @Param("reason") String reason,
                   @Param("passed") boolean passed);

    /**
     * Count tasks by job and status.
     */
    long countByJobAndStatus(Job job, TaskStatus status);

    /**
     * Count approved tasks by job.
     */
    @Query("SELECT COUNT(t) FROM Task t WHERE t.job = :job AND t.status = 'APPROVED'")
    long countApprovedByJob(@Param("job") Job job);

    /**
     * Count tasks by reviewer.
     */
    long countByReviewer(ReviewerProfile reviewer);

    /**
     * Get task statistics for a job.
     */
    @Query("SELECT t.status, COUNT(t) FROM Task t WHERE t.job = :job GROUP BY t.status")
    List<Object[]> getTaskStatsByJob(@Param("job") Job job);

    /**
     * Count approved tasks for a reviewer since a given date.
     */
    @Query("SELECT COUNT(t) FROM Task t WHERE t.reviewer = :reviewer " +
            "AND t.status = 'APPROVED' AND t.reviewedAt >= :since")
    int countApprovedByReviewerSince(@Param("reviewer") ReviewerProfile reviewer,
                                     @Param("since") Instant since);

    /**
     * Sum pay amounts for approved tasks for a reviewer since a given date.
     */
    @Query("SELECT COALESCE(SUM(t.payAmount), 0) FROM Task t WHERE t.reviewer = :reviewer " +
            "AND t.status = 'APPROVED' AND t.reviewedAt >= :since")
    double sumPayAmountByReviewerSince(@Param("reviewer") ReviewerProfile reviewer,
                                       @Param("since") Instant since);

    /**
     * Get daily earnings breakdown for a reviewer (last N days).
     * Returns date and sum of payAmount grouped by date.
     */
    @Query("SELECT FUNCTION('DATE', t.reviewedAt) as date, COUNT(t), SUM(t.payAmount) " +
            "FROM Task t WHERE t.reviewer = :reviewer AND t.status = 'APPROVED' " +
            "AND t.reviewedAt >= :since " +
            "GROUP BY FUNCTION('DATE', t.reviewedAt) " +
            "ORDER BY FUNCTION('DATE', t.reviewedAt) DESC")
    List<Object[]> getDailyEarningsBreakdown(@Param("reviewer") ReviewerProfile reviewer,
                                             @Param("since") Instant since);

    /**
     * Count tasks by status.
     */
    long countByStatus(TaskStatus status);

    /**
     * Count approved tasks since a given time (for daily stats).
     */
    @Query("SELECT COUNT(t) FROM Task t WHERE t.status = 'APPROVED' AND t.reviewedAt >= :since")
    long countApprovedSince(@Param("since") Instant since);

    /**
     * Find tasks by job and status.
     */
    List<Task> findByJobAndStatus(Job job, TaskStatus status);
}
