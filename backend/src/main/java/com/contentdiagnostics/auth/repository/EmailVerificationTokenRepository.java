package com.contentdiagnostics.auth.repository;

import com.contentdiagnostics.auth.entity.EmailVerificationToken;
import com.contentdiagnostics.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

/**
 * Repository for email verification tokens.
 */
@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {

    /**
     * Find a token by its value.
     */
    Optional<EmailVerificationToken> findByToken(String token);

    /**
     * Find the latest valid token for a user.
     */
    @Query("SELECT t FROM EmailVerificationToken t WHERE t.user = :user AND t.used = false AND t.expiresAt > :now ORDER BY t.createdAt DESC")
    Optional<EmailVerificationToken> findValidTokenForUser(@Param("user") User user, @Param("now") Instant now);

    /**
     * Invalidate all tokens for a user.
     */
    @Modifying
    @Query("UPDATE EmailVerificationToken t SET t.used = true WHERE t.user = :user AND t.used = false")
    void invalidateAllForUser(@Param("user") User user);

    /**
     * Delete expired tokens (cleanup job).
     */
    @Modifying
    @Query("DELETE FROM EmailVerificationToken t WHERE t.expiresAt < :now")
    int deleteExpiredTokens(@Param("now") Instant now);

    /**
     * Check if user has a valid (non-expired, non-used) token.
     */
    @Query("SELECT COUNT(t) > 0 FROM EmailVerificationToken t WHERE t.user = :user AND t.used = false AND t.expiresAt > :now")
    boolean hasValidToken(@Param("user") User user, @Param("now") Instant now);
}
