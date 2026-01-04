package com.contentdiagnostics.addons.repository;

import com.contentdiagnostics.addons.entity.AppliedAddon;
import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.jobs.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Repository
public interface AppliedAddonRepository extends JpaRepository<AppliedAddon, Long> {
    List<AppliedAddon> findByCreatorOrderByAppliedAtDesc(User creator);
    List<AppliedAddon> findByJob(Job job);
    List<AppliedAddon> findByCreatorAndStatusOrderByAppliedAtDesc(User creator, AppliedAddon.AppliedAddonStatus status);

    /**
     * Find applied addons for a creator within a date range.
     */
    @Query("SELECT a FROM AppliedAddon a WHERE a.creator = :creator AND a.appliedAt >= :startDate AND a.appliedAt < :endDate ORDER BY a.appliedAt DESC")
    List<AppliedAddon> findByCreatorAndDateRange(
            @Param("creator") User creator,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate);

    /**
     * Calculate total addon spend for a creator within a date range (price * quantity).
     */
    @Query("SELECT COALESCE(SUM(a.price * a.quantity), 0) FROM AppliedAddon a WHERE a.creator = :creator AND a.appliedAt >= :startDate AND a.appliedAt < :endDate")
    BigDecimal calculateTotalSpend(
            @Param("creator") User creator,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate);

    /**
     * Get all applied addons (admin view) with pagination.
     */
    Page<AppliedAddon> findAllByOrderByAppliedAtDesc(Pageable pageable);

    /**
     * Count applied addons by status.
     */
    long countByStatus(AppliedAddon.AppliedAddonStatus status);

    /**
     * Count applied addons by addon.
     */
    long countByAddon(com.contentdiagnostics.addons.entity.Addon addon);

    /**
     * Get usage counts for all addons in a single query (avoids N+1).
     * Returns list of [addonId, count] arrays.
     */
    @Query("SELECT a.addon.id, COUNT(a) FROM AppliedAddon a GROUP BY a.addon.id")
    List<Object[]> findAddonUsageCounts();
}
