package com.contentdiagnostics.plans.repository;

import com.contentdiagnostics.plans.entity.Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlanRepository extends JpaRepository<Plan, Long> {

    /**
     * Find a plan by its tier code (e.g., "basic", "professional", "enterprise").
     */
    Optional<Plan> findByTierCode(String tierCode);

    /**
     * Find all active plans ordered by sort order.
     */
    List<Plan> findByActiveTrueOrderBySortOrderAsc();

    /**
     * Check if a plan tier code exists.
     */
    boolean existsByTierCode(String tierCode);
}
