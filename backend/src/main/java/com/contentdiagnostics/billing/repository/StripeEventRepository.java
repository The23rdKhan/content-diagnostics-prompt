package com.contentdiagnostics.billing.repository;

import com.contentdiagnostics.billing.entity.StripeEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for StripeEvent entities.
 */
@Repository
public interface StripeEventRepository extends JpaRepository<StripeEvent, Long> {

    /**
     * Find event by Stripe event ID.
     */
    Optional<StripeEvent> findByEventId(String eventId);

    /**
     * Check if event has been processed.
     */
    boolean existsByEventId(String eventId);
}
