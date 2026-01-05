package com.contentdiagnostics.reviewers.repository;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.reviewers.entity.QualificationSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Repository for qualification test submissions.
 */
@Repository
public interface QualificationSubmissionRepository extends JpaRepository<QualificationSubmission, Long> {

    /**
     * Count total attempts by user.
     */
    long countByUser(User user);

    /**
     * Find all submissions by user ordered by submission time.
     */
    List<QualificationSubmission> findByUserOrderBySubmittedAtDesc(User user);

    /**
     * Find the most recent submission by user.
     */
    Optional<QualificationSubmission> findFirstByUserOrderBySubmittedAtDesc(User user);

    /**
     * Check if user has a submission after a given time (for cooldown).
     */
    @Query("SELECT COUNT(qs) > 0 FROM QualificationSubmission qs WHERE qs.user = :user AND qs.submittedAt > :since")
    boolean hasSubmissionSince(@Param("user") User user, @Param("since") Instant since);

    /**
     * Find the most recent failed submission (for cooldown calculation).
     */
    @Query("SELECT qs FROM QualificationSubmission qs WHERE qs.user = :user AND qs.passed = false ORDER BY qs.submittedAt DESC")
    Optional<QualificationSubmission> findMostRecentFailedSubmission(@Param("user") User user);
}
