package com.contentdiagnostics.common.util;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.common.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * Utility class for security-related operations.
 */
public final class SecurityUtils {

    private SecurityUtils() {
        // Utility class
    }

    /**
     * Get the currently authenticated user.
     *
     * @return the current user
     * @throws UnauthorizedException if no user is authenticated
     */
    public static User getCurrentUser() {
        return getCurrentUserOptional()
                .orElseThrow(() -> new UnauthorizedException("No authenticated user"));
    }

    /**
     * Get the currently authenticated user as Optional.
     *
     * @return Optional containing the current user, or empty if not authenticated
     */
    public static Optional<User> getCurrentUserOptional() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            return Optional.empty();
        }

        Object principal = auth.getPrincipal();

        if (principal instanceof User user) {
            return Optional.of(user);
        }

        return Optional.empty();
    }

    /**
     * Get the ID of the currently authenticated user.
     *
     * @return the current user's ID
     * @throws UnauthorizedException if no user is authenticated
     */
    public static Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    /**
     * Check if the current user has the specified role.
     *
     * @param role the role to check
     * @return true if the user has the role
     */
    public static boolean hasRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        String roleWithPrefix = role.startsWith("ROLE_") ? role : "ROLE_" + role;

        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(roleWithPrefix));
    }

    /**
     * Check if the current user is an admin.
     */
    public static boolean isAdmin() {
        return hasRole("ADMIN");
    }

    /**
     * Check if the current user is a creator.
     */
    public static boolean isCreator() {
        return hasRole("CREATOR");
    }

    /**
     * Check if the current user is a reviewer.
     */
    public static boolean isReviewer() {
        return hasRole("REVIEWER");
    }
}
