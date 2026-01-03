package com.contentdiagnostics.credits.repository;

import com.contentdiagnostics.creators.entity.CreatorProfile;
import com.contentdiagnostics.credits.entity.CreditTransaction;
import com.contentdiagnostics.credits.entity.CreditTransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Repository for CreditTransaction entities.
 */
@Repository
public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Long> {

    /**
     * Find transactions by creator, ordered by most recent.
     */
    Page<CreditTransaction> findByCreatorOrderByCreatedAtDesc(CreatorProfile creator, Pageable pageable);

    /**
     * Find transactions by creator and type.
     */
    List<CreditTransaction> findByCreatorAndTypeOrderByCreatedAtDesc(CreatorProfile creator, CreditTransactionType type);

    /**
     * Find transaction by Stripe payment intent ID.
     */
    Optional<CreditTransaction> findByStripePaymentIntentId(String paymentIntentId);

    /**
     * Sum credits purchased by creator in date range.
     */
    @Query("SELECT COALESCE(SUM(ct.amount), 0) FROM CreditTransaction ct " +
            "WHERE ct.creator = :creator AND ct.type = 'PURCHASE' " +
            "AND ct.createdAt BETWEEN :start AND :end")
    int sumPurchasedCredits(@Param("creator") CreatorProfile creator,
                            @Param("start") Instant start,
                            @Param("end") Instant end);

    /**
     * Sum credits used by creator in date range.
     */
    @Query("SELECT COALESCE(SUM(ABS(ct.amount)), 0) FROM CreditTransaction ct " +
            "WHERE ct.creator = :creator AND ct.type = 'USAGE' " +
            "AND ct.createdAt BETWEEN :start AND :end")
    int sumUsedCredits(@Param("creator") CreatorProfile creator,
                       @Param("start") Instant start,
                       @Param("end") Instant end);

    /**
     * Find transaction by job ID for refund lookup.
     */
    Optional<CreditTransaction> findByJobId(Long jobId);
}
