package com.contentdiagnostics.reviewers.repository;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.reviewers.entity.ReviewerProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for ReviewerProfile entities.
 */
@Repository
public interface ReviewerProfileRepository extends JpaRepository<ReviewerProfile, Long> {

    /**
     * Find profile by user.
     */
    Optional<ReviewerProfile> findByUser(User user);

    /**
     * Find profile by user ID.
     */
    @Query("SELECT rp FROM ReviewerProfile rp WHERE rp.user.id = :userId")
    Optional<ReviewerProfile> findByUserId(@Param("userId") Long userId);

    /**
     * Find all active reviewers for a language.
     */
    @Query("SELECT rp FROM ReviewerProfile rp WHERE rp.language = :language " +
            "AND rp.qualificationPassed = true AND rp.queueLocked = false")
    List<ReviewerProfile> findActiveByLanguage(@Param("language") String language);

    /**
     * Count active reviewers for a language.
     */
    @Query("SELECT COUNT(rp) FROM ReviewerProfile rp WHERE rp.language = :language " +
            "AND rp.qualificationPassed = true AND rp.queueLocked = false")
    long countActiveByLanguage(@Param("language") String language);

    /**
     * Find reviewers by qualification status.
     */
    Page<ReviewerProfile> findByQualificationPassed(boolean passed, Pageable pageable);

    /**
     * Find reviewers by queue locked status.
     */
    Page<ReviewerProfile> findByQueueLocked(boolean locked, Pageable pageable);

    /**
     * Update quality score (atomic).
     */
    @Modifying
    @Query("UPDATE ReviewerProfile rp SET rp.qualityScore = :score, " +
            "rp.queueLocked = CASE WHEN :score < 60 THEN true ELSE rp.queueLocked END " +
            "WHERE rp.id = :profileId")
    int updateQualityScore(@Param("profileId") Long profileId, @Param("score") int score);

    /**
     * Increment task stats on approval.
     */
    @Modifying
    @Query("UPDATE ReviewerProfile rp SET " +
            "rp.tasksCompleted = rp.tasksCompleted + 1, " +
            "rp.tasksApproved = rp.tasksApproved + 1, " +
            "rp.qualityScore = LEAST(100, rp.qualityScore + :scoreIncrease), " +
            "rp.pendingEarnings = rp.pendingEarnings + :earnings " +
            "WHERE rp.id = :profileId")
    int recordApproval(@Param("profileId") Long profileId,
                       @Param("earnings") double earnings,
                       @Param("scoreIncrease") int scoreIncrease);

    /**
     * Increment task stats on rejection.
     */
    @Modifying
    @Query("UPDATE ReviewerProfile rp SET " +
            "rp.tasksCompleted = rp.tasksCompleted + 1, " +
            "rp.tasksRejected = rp.tasksRejected + 1, " +
            "rp.qualityScore = GREATEST(0, rp.qualityScore - :scoreDecrease), " +
            "rp.queueLocked = CASE WHEN (rp.qualityScore - :scoreDecrease) < 60 THEN true ELSE rp.queueLocked END " +
            "WHERE rp.id = :profileId")
    int recordRejection(@Param("profileId") Long profileId, @Param("scoreDecrease") int scoreDecrease);

    /**
     * Move pending earnings to total on payout.
     */
    @Modifying
    @Query("UPDATE ReviewerProfile rp SET " +
            "rp.totalEarnings = rp.totalEarnings + :amount, " +
            "rp.pendingEarnings = rp.pendingEarnings - :amount " +
            "WHERE rp.id = :profileId AND rp.pendingEarnings >= :amount")
    int processPayout(@Param("profileId") Long profileId, @Param("amount") double amount);

    /**
     * Pass qualification.
     */
    @Modifying
    @Query("UPDATE ReviewerProfile rp SET rp.qualificationPassed = true, rp.queueLocked = false " +
            "WHERE rp.id = :profileId")
    int passQualification(@Param("profileId") Long profileId);
}
