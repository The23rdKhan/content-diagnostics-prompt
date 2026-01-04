package com.contentdiagnostics.admin.repository;

import com.contentdiagnostics.admin.entity.LanguagePoolSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for LanguagePoolSettings entities.
 */
@Repository
public interface LanguagePoolSettingsRepository extends JpaRepository<LanguagePoolSettings, Long> {

    /**
     * Find settings by language code.
     */
    Optional<LanguagePoolSettings> findByLanguageCode(String languageCode);

    /**
     * Find all active language pools.
     */
    List<LanguagePoolSettings> findByActiveTrueOrderByDisplayNameAsc();
}
