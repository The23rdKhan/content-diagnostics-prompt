package com.contentdiagnostics.creators.repository;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.creators.entity.CreatorProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for CreatorProfile entities.
 */
@Repository
public interface CreatorProfileRepository extends JpaRepository<CreatorProfile, Long> {

    /**
     * Find profile by user.
     */
    Optional<CreatorProfile> findByUser(User user);

    /**
     * Find profile by user ID.
     */
    @Query("SELECT cp FROM CreatorProfile cp WHERE cp.user.id = :userId")
    Optional<CreatorProfile> findByUserId(@Param("userId") Long userId);

    /**
     * Find profile by Stripe customer ID.
     */
    Optional<CreatorProfile> findByStripeCustomerId(String stripeCustomerId);

    /**
     * Find all creators by plan tier.
     */
    Page<CreatorProfile> findByPlanTier(String planTier, Pageable pageable);

    /**
     * Update remaining credits.
     */
    @Modifying
    @Query("UPDATE CreatorProfile cp SET cp.remainingCredits = cp.remainingCredits + :credits WHERE cp.id = :profileId")
    int addCredits(@Param("profileId") Long profileId, @Param("credits") int credits);

    /**
     * Deduct credits (atomic).
     */
    @Modifying
    @Query("UPDATE CreatorProfile cp SET cp.remainingCredits = cp.remainingCredits - :credits " +
            "WHERE cp.id = :profileId AND cp.remainingCredits >= :credits")
    int deductCredits(@Param("profileId") Long profileId, @Param("credits") int credits);

    /**
     * Update Stripe subscription info.
     */
    @Modifying
    @Query("UPDATE CreatorProfile cp SET cp.stripeCustomerId = :customerId, " +
            "cp.stripeSubscriptionId = :subscriptionId, cp.planTier = :planTier " +
            "WHERE cp.id = :profileId")
    int updateSubscription(@Param("profileId") Long profileId,
                           @Param("customerId") String customerId,
                           @Param("subscriptionId") String subscriptionId,
                           @Param("planTier") String planTier);

    /**
     * Count creators by plan tier.
     */
    long countByPlanTier(String planTier);
}
