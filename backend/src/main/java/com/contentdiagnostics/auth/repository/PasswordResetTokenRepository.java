package com.contentdiagnostics.auth.repository;

import com.contentdiagnostics.auth.entity.PasswordResetToken;
import com.contentdiagnostics.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

/**
 * Repository for password reset tokens.
 */
@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    /**
     * Find a valid token by token string.
     */
    Optional<PasswordResetToken> findByToken(String token);

    /**
     * Find the most recent token for a user.
     */
    Optional<PasswordResetToken> findTopByUserOrderByCreatedAtDesc(User user);

    /**
     * Invalidate all tokens for a user.
     */
    @Modifying
    @Query("UPDATE PasswordResetToken t SET t.used = true WHERE t.user = :user AND t.used = false")
    int invalidateAllForUser(@Param("user") User user);

    /**
     * Delete expired tokens (cleanup job).
     */
    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.expiresAt < :now")
    int deleteExpiredTokens(@Param("now") Instant now);
}
