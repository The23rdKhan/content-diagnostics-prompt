package com.contentdiagnostics.credits.repository;

import com.contentdiagnostics.credits.entity.CreditBundle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CreditBundleRepository extends JpaRepository<CreditBundle, Long> {

    /**
     * Find a bundle by its code (e.g., "starter", "creator", "pro", "studio").
     */
    Optional<CreditBundle> findByBundleCode(String bundleCode);

    /**
     * Find all active bundles ordered by sort order.
     */
    List<CreditBundle> findByActiveTrueOrderBySortOrderAsc();

    /**
     * Check if a bundle code exists.
     */
    boolean existsByBundleCode(String bundleCode);
}
