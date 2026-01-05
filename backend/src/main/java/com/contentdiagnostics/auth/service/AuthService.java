package com.contentdiagnostics.auth.service;

import com.contentdiagnostics.auth.dto.*;
import com.contentdiagnostics.auth.entity.EmailVerificationToken;
import com.contentdiagnostics.auth.entity.PasswordResetToken;
import com.contentdiagnostics.auth.entity.RefreshToken;
import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.auth.entity.UserRole;
import com.contentdiagnostics.auth.repository.EmailVerificationTokenRepository;
import com.contentdiagnostics.auth.repository.PasswordResetTokenRepository;
import com.contentdiagnostics.auth.repository.RefreshTokenRepository;
import com.contentdiagnostics.auth.repository.UserRepository;
import com.contentdiagnostics.common.exception.BadRequestException;
import com.contentdiagnostics.common.exception.ConflictException;
import com.contentdiagnostics.common.exception.UnauthorizedException;
import com.contentdiagnostics.creators.entity.CreatorProfile;
import com.contentdiagnostics.creators.repository.CreatorProfileRepository;
import com.contentdiagnostics.notifications.entity.NotificationType;
import com.contentdiagnostics.notifications.service.NotificationService;
import com.contentdiagnostics.reviewers.entity.ReviewerProfile;
import com.contentdiagnostics.reviewers.repository.ReviewerProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Service handling authentication operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final CreatorProfileRepository creatorProfileRepository;
    private final ReviewerProfileRepository reviewerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final NotificationService notificationService;

    @Value("${app.reviewer.initial-quality-score:100}")
    private int initialQualityScore;

    @Value("${app.base-url:http://localhost:3000}")
    private String baseUrl;

    /**
     * Register a new user.
     */
    @Transactional
    public AuthResponse signUp(SignUpRequest request, String userAgent, String ipAddress) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered");
        }

        // Admin role cannot be self-registered
        if (request.getRole() == UserRole.ADMIN) {
            throw new BadRequestException("Admin accounts cannot be self-registered", "INVALID_ROLE");
        }

        // Create user with new signup fields
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .phoneNumber(request.getPhoneNumber())
                .country(request.getCountry())
                .timezone(request.getTimezone())
                .tosAcceptedAt(request.isTosAccepted() ? Instant.now() : null)
                .tosVersion("1.0")
                .marketingConsent(request.isMarketingConsent())
                .enabled(true)
                .emailVerified(false)
                .build();

        user = userRepository.save(user);

        // Create role-specific profile
        createRoleProfile(user, request);

        // Send welcome notification
        notificationService.createNotification(
                user,
                NotificationType.WELCOME,
                Map.of("role", user.getRole().name())
        );

        // Send email verification
        sendVerificationEmail(user);

        log.info("New user registered: {} as {}", user.getEmail(), user.getRole());

        // Generate tokens
        return createAuthResponse(user, userAgent, ipAddress);
    }

    /**
     * Authenticate a user and return tokens.
     */
    @Transactional
    public AuthResponse login(LoginRequest request, String userAgent, String ipAddress) {
        // Authenticate
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = (User) authentication.getPrincipal();

        // Update last login
        userRepository.updateLastLoginAt(user.getId(), Instant.now());

        // Generate tokens
        return createAuthResponse(user, userAgent, ipAddress);
    }

    /**
     * Refresh access token using a refresh token.
     */
    @Transactional
    public AuthResponse refreshToken(String refreshToken, String userAgent, String ipAddress) {
        RefreshToken token = refreshTokenRepository.findValidToken(refreshToken, Instant.now())
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired refresh token"));

        // Revoke the old token (rotation)
        token.setRevoked(true);
        refreshTokenRepository.save(token);

        User user = token.getUser();

        // Generate new tokens
        return createAuthResponse(user, userAgent, ipAddress);
    }

    /**
     * Logout user by revoking refresh token.
     */
    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.revokeToken(refreshToken);
    }

    /**
     * Logout from all devices by revoking all refresh tokens.
     */
    @Transactional
    public void logoutAll(User user) {
        refreshTokenRepository.revokeAllUserTokens(user);
    }

    /**
     * Get current user profile.
     */
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(User user) {
        UserProfileResponse.UserProfileResponseBuilder builder = UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .emailVerified(user.isEmailVerified())
                .phoneNumber(user.getPhoneNumber())
                .country(user.getCountry())
                .timezone(user.getTimezone())
                .tosAcceptedAt(user.getTosAcceptedAt())
                .marketingConsent(user.isMarketingConsent())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt());

        // Add role-specific profile
        switch (user.getRole()) {
            case CREATOR -> {
                creatorProfileRepository.findByUser(user).ifPresent(profile ->
                        builder.creatorProfile(mapCreatorProfile(profile)));
            }
            case REVIEWER -> {
                reviewerProfileRepository.findByUser(user).ifPresent(profile ->
                        builder.reviewerProfile(mapReviewerProfile(profile)));
            }
            case ADMIN -> {
                builder.adminProfile(UserProfileResponse.AdminProfile.builder()
                        .name("Admin")
                        .permissions(List.of("all"))
                        .build());
            }
        }

        return builder.build();
    }

    // --- Password Reset ---

    /**
     * Initiate password reset for an email address.
     * Silently succeeds even if email doesn't exist (prevents enumeration).
     */
    @Transactional
    public void forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            // Invalidate any existing tokens for this user
            passwordResetTokenRepository.invalidateAllForUser(user);

            // Generate new token
            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .token(token)
                    .user(user)
                    .expiresAt(Instant.now().plus(1, ChronoUnit.HOURS))
                    .build();

            passwordResetTokenRepository.save(resetToken);

            // Send password reset email
            String resetLink = baseUrl + "/auth/reset-password?token=" + token;
            notificationService.createNotification(
                    user,
                    NotificationType.PASSWORD_RESET,
                    Map.of("resetLink", resetLink)
            );

            log.info("Password reset token generated for user: {}", user.getId());
        });
    }

    /**
     * Reset password using a valid token.
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token", "INVALID_TOKEN"));

        if (!resetToken.isValid()) {
            throw new BadRequestException("Reset token has expired or already been used", "TOKEN_EXPIRED");
        }

        User user = resetToken.getUser();

        // Update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        // Revoke all refresh tokens (log out from all devices)
        refreshTokenRepository.revokeAllUserTokens(user);

        log.info("Password reset completed for user: {}", user.getId());
    }

    // --- Email Verification ---

    /**
     * Verify user's email using a valid token.
     */
    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired verification token", "INVALID_TOKEN"));

        if (!verificationToken.isValid()) {
            throw new BadRequestException("Verification token has expired or already been used", "TOKEN_EXPIRED");
        }

        User user = verificationToken.getUser();

        // Mark email as verified
        user.setEmailVerified(true);
        userRepository.save(user);

        // Mark token as used
        verificationToken.setUsed(true);
        emailVerificationTokenRepository.save(verificationToken);

        log.info("Email verified for user: {}", user.getId());
    }

    /**
     * Resend verification email if user hasn't verified yet.
     */
    @Transactional
    public void resendVerification(User user) {
        if (user.isEmailVerified()) {
            throw new BadRequestException("Email is already verified", "ALREADY_VERIFIED");
        }

        // Invalidate existing tokens
        emailVerificationTokenRepository.invalidateAllForUser(user);

        // Send new verification email
        sendVerificationEmail(user);

        log.info("Verification email resent for user: {}", user.getId());
    }

    /**
     * Send verification email to user.
     */
    private void sendVerificationEmail(User user) {
        // Generate verification token
        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .token(token)
                .user(user)
                .expiresAt(Instant.now().plus(24, ChronoUnit.HOURS))
                .build();

        emailVerificationTokenRepository.save(verificationToken);

        // Send email verification notification
        String verifyLink = baseUrl + "/auth/verify-email?token=" + token;
        notificationService.createNotification(
                user,
                NotificationType.EMAIL_VERIFICATION,
                Map.of("verifyLink", verifyLink)
        );
    }

    // --- Helper methods ---

    private AuthResponse createAuthResponse(User user, String userAgent, String ipAddress) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // Store refresh token
        RefreshToken tokenEntity = RefreshToken.builder()
                .token(refreshToken)
                .user(user)
                .expiresAt(jwtService.getRefreshTokenExpiration())
                .userAgent(userAgent)
                .ipAddress(ipAddress)
                .build();

        refreshTokenRepository.save(tokenEntity);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpirationSeconds())
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .emailVerified(user.isEmailVerified())
                        .build())
                .build();
    }

    private void createRoleProfile(User user, SignUpRequest request) {
        switch (user.getRole()) {
            case CREATOR -> {
                CreatorProfile profile = CreatorProfile.builder()
                        .user(user)
                        .firstName(request.getFirstName())
                        .lastName(request.getLastName())
                        .name(request.getName()) // Legacy field for backward compatibility
                        .company(request.getCompany())
                        .primaryLanguage("English") // MVP: English-only
                        .planTier("basic")
                        .remainingCredits(0)
                        .build();
                creatorProfileRepository.save(profile);
            }
            case REVIEWER -> {
                ReviewerProfile profile = ReviewerProfile.builder()
                        .user(user)
                        .firstName(request.getFirstName())
                        .lastName(request.getLastName())
                        .name(request.getName()) // Legacy field for backward compatibility
                        .language("English") // MVP: English-only
                        .proficiency(request.getProficiency() != null ? request.getProficiency() : "native")
                        .payoutMethod(request.getPreferredPayoutMethod())
                        .qualificationPassed(false)
                        .qualityScore(initialQualityScore)
                        .queueLocked(true) // Locked until qualification passed
                        .tasksCompleted(0)
                        .tasksApproved(0)
                        .tasksRejected(0)
                        .totalEarnings(0.0)
                        .build();
                reviewerProfileRepository.save(profile);
            }
            case ADMIN -> {
                // Admin profiles are created manually
            }
        }
    }

    private UserProfileResponse.CreatorProfile mapCreatorProfile(CreatorProfile profile) {
        return UserProfileResponse.CreatorProfile.builder()
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .displayName(profile.getDisplayName())
                .company(profile.getCompany())
                .profileImageUrl(profile.getProfileImageUrl())
                .bannerImageUrl(profile.getBannerImageUrl())
                .primaryLanguage(profile.getPrimaryLanguage())
                .planTier(profile.getPlanTier())
                .remainingCredits(profile.getRemainingCredits())
                .build();
    }

    private UserProfileResponse.ReviewerProfile mapReviewerProfile(ReviewerProfile profile) {
        return UserProfileResponse.ReviewerProfile.builder()
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .displayName(profile.getDisplayName())
                .profileImageUrl(profile.getProfileImageUrl())
                .language(profile.getLanguage())
                .proficiency(profile.getProficiency())
                .qualificationPassed(profile.isQualificationPassed())
                .qualityScore(profile.getQualityScore())
                .queueLocked(profile.isQueueLocked())
                .tasksCompleted(profile.getTasksCompleted())
                .totalEarnings(profile.getTotalEarnings())
                .build();
    }
}
