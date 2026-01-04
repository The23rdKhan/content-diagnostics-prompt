package com.contentdiagnostics.jobs.repository;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.jobs.entity.Job;
import com.contentdiagnostics.jobs.entity.JobStatus;
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
 * Repository for Job entities.
 */
@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    /**
     * Find all jobs by creator.
     */
    Page<Job> findByCreator(User creator, Pageable pageable);

    /**
     * Find all jobs by creator ordered by creation date.
     */
    List<Job> findByCreatorOrderByCreatedAtDesc(User creator);

    /**
     * Find job by ID and creator.
     */
    Optional<Job> findByIdAndCreator(Long id, User creator);

    /**
     * Find jobs by status.
     */
    List<Job> findByStatus(JobStatus status);

    /**
     * Find jobs in active states (for monitoring).
     */
    @Query("SELECT j FROM Job j WHERE j.status IN :statuses")
    List<Job> findByStatusIn(@Param("statuses") List<JobStatus> statuses);

    /**
     * Find jobs at risk of missing SLA.
     */
    @Query("SELECT j FROM Job j WHERE j.status IN ('IN_REVIEW', 'COMPILING') " +
            "AND j.slaDeadline < :deadline")
    List<Job> findJobsAtRisk(@Param("deadline") Instant deadline);

    /**
     * Update job status.
     */
    @Modifying
    @Query("UPDATE Job j SET j.status = :status WHERE j.id = :jobId")
    int updateStatus(@Param("jobId") Long jobId, @Param("status") JobStatus status);

    /**
     * Increment completed reviewers count.
     */
    @Modifying
    @Query("UPDATE Job j SET j.completedReviewers = j.completedReviewers + 1 WHERE j.id = :jobId")
    int incrementCompletedReviewers(@Param("jobId") Long jobId);

    /**
     * Mark AI diagnostics complete.
     */
    @Modifying
    @Query("UPDATE Job j SET j.aiDiagnosticsComplete = true WHERE j.id = :jobId")
    int markAiDiagnosticsComplete(@Param("jobId") Long jobId);

    /**
     * Mark human review complete.
     */
    @Modifying
    @Query("UPDATE Job j SET j.humanReviewComplete = true WHERE j.id = :jobId")
    int markHumanReviewComplete(@Param("jobId") Long jobId);

    /**
     * Mark job as delivered.
     */
    @Modifying
    @Query("UPDATE Job j SET j.status = 'DELIVERED', j.reportCompiled = true, " +
            "j.deliveredAt = :deliveredAt, j.deliveryTimeHours = :hours WHERE j.id = :jobId")
    int markDelivered(@Param("jobId") Long jobId,
                      @Param("deliveredAt") Instant deliveredAt,
                      @Param("hours") int hours);

    /**
     * Count jobs by creator and status.
     */
    long countByCreatorAndStatus(User creator, JobStatus status);

    /**
     * Count active jobs by language.
     */
    @Query("SELECT COUNT(j) FROM Job j WHERE j.language = :language AND j.status IN ('IN_REVIEW', 'SEGMENTED')")
    long countActiveByLanguage(@Param("language") String language);

    /**
     * Count jobs by statuses.
     */
    @Query("SELECT COUNT(j) FROM Job j WHERE j.status IN :statuses")
    long countByStatusIn(@Param("statuses") List<JobStatus> statuses);

    /**
     * Count jobs created by a user since a given date.
     */
    @Query("SELECT COUNT(j) FROM Job j WHERE j.creator = :creator AND j.createdAt >= :since")
    long countByCreatorSince(@Param("creator") User creator, @Param("since") Instant since);
}
