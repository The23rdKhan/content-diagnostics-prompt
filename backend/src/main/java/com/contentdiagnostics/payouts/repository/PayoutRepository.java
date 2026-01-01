package com.contentdiagnostics.payouts.repository;

import com.contentdiagnostics.payouts.entity.Payout;
import com.contentdiagnostics.payouts.entity.PayoutStatus;
import com.contentdiagnostics.reviewers.entity.ReviewerProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Payout entities.
 */
@Repository
public interface PayoutRepository extends JpaRepository<Payout, Long> {

    /**
     * Find payouts by reviewer.
     */
    List<Payout> findByReviewerOrderByCreatedAtDesc(ReviewerProfile reviewer);

    /**
     * Find payouts by status.
     */
    Page<Payout> findByStatus(PayoutStatus status, Pageable pageable);

    /**
     * Find pending payouts ready for release.
     */
    List<Payout> findByStatusOrderByCreatedAtAsc(PayoutStatus status);
}
