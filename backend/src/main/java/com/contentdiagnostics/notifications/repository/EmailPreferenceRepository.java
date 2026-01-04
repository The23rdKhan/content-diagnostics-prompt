package com.contentdiagnostics.notifications.repository;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.notifications.entity.EmailPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for EmailPreference entities.
 */
@Repository
public interface EmailPreferenceRepository extends JpaRepository<EmailPreference, Long> {

    /**
     * Find preferences by user.
     */
    Optional<EmailPreference> findByUser(User user);

    /**
     * Find preferences by user ID (for async event handling).
     */
    Optional<EmailPreference> findByUserId(Long userId);
}
