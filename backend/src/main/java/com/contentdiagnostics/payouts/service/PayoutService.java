package com.contentdiagnostics.payouts.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.common.exception.ValidationException;
import com.contentdiagnostics.payouts.dto.PayoutDto;
import com.contentdiagnostics.payouts.dto.RequestPayoutRequest;
import com.contentdiagnostics.payouts.entity.Payout;
import com.contentdiagnostics.payouts.entity.PayoutStatus;
import com.contentdiagnostics.payouts.repository.PayoutRepository;
import com.contentdiagnostics.reviewers.entity.ReviewerProfile;
import com.contentdiagnostics.reviewers.repository.ReviewerProfileRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing reviewer payouts.
 */
@Slf4j
@Service
public class PayoutService {

    private final PayoutRepository payoutRepository;
    private final ReviewerProfileRepository reviewerProfileRepository;
    private final double minimumPayoutAmount;

    public PayoutService(
            PayoutRepository payoutRepository,
            ReviewerProfileRepository reviewerProfileRepository,
            @Value("${app.payout.minimum-amount:10.0}") double minimumPayoutAmount) {
        this.payoutRepository = payoutRepository;
        this.reviewerProfileRepository = reviewerProfileRepository;
        this.minimumPayoutAmount = minimumPayoutAmount;
    }

    /**
     * Get all payouts for a reviewer.
     */
    @Transactional(readOnly = true)
    public List<PayoutDto> getReviewerPayouts(User user) {
        ReviewerProfile profile = getReviewerProfile(user);

        return payoutRepository.findByReviewerOrderByCreatedAtDesc(profile)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Request a payout for pending earnings.
     */
    @Transactional
    public PayoutDto requestPayout(User user, RequestPayoutRequest request) {
        ReviewerProfile profile = getReviewerProfile(user);

        // Validate payout method is set
        if (profile.getPayoutMethod() == null) {
            throw new ValidationException("Payout method not configured. Please update your payout settings.");
        }

        // Validate minimum payout amount
        double amount = request.getAmount() != null ? request.getAmount() : profile.getPendingEarnings();
        if (amount < minimumPayoutAmount) {
            throw new ValidationException(
                    String.format("Minimum payout amount is $%.2f. Current pending: $%.2f",
                            minimumPayoutAmount, profile.getPendingEarnings()));
        }

        if (amount > profile.getPendingEarnings()) {
            throw new ValidationException(
                    String.format("Requested amount $%.2f exceeds pending earnings $%.2f",
                            amount, profile.getPendingEarnings()));
        }

        // Calculate tasks included (approximate based on average task pay)
        int tasksIncluded = profile.getTasksCompleted() > 0
                ? (int) Math.round(amount / (profile.getTotalEarnings() / profile.getTasksCompleted()))
                : 0;

        // Create payout record
        Payout payout = Payout.builder()
                .reviewer(profile)
                .amount(amount)
                .tasksIncluded(tasksIncluded)
                .status(PayoutStatus.PENDING)
                .build();

        Payout saved = payoutRepository.save(payout);

        // Deduct from pending earnings
        profile.setPendingEarnings(profile.getPendingEarnings() - amount);
        reviewerProfileRepository.save(profile);

        log.info("Payout requested: reviewer={}, amount={}", profile.getId(), amount);

        return toDto(saved);
    }

    /**
     * Get all payouts by status (admin).
     */
    @Transactional(readOnly = true)
    public Page<PayoutDto> getPayoutsByStatus(PayoutStatus status, Pageable pageable) {
        return payoutRepository.findByStatus(status, pageable)
                .map(this::toDto);
    }

    /**
     * Get pending payouts ready for release (admin).
     */
    @Transactional(readOnly = true)
    public List<PayoutDto> getPendingPayouts() {
        return payoutRepository.findByStatusOrderByCreatedAtAsc(PayoutStatus.READY)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Advance payout to QC status (admin).
     */
    @Transactional
    public PayoutDto advanceToQc(Long payoutId) {
        Payout payout = payoutRepository.findById(payoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Payout not found"));

        if (payout.getStatus() != PayoutStatus.PENDING) {
            throw new ValidationException("Only pending payouts can be advanced to QC");
        }

        payout.setStatus(PayoutStatus.QC);
        Payout saved = payoutRepository.save(payout);

        log.info("Payout advanced to QC: id={}", payoutId);
        return toDto(saved);
    }

    /**
     * Mark payout as ready for release (admin).
     */
    @Transactional
    public PayoutDto markReady(Long payoutId) {
        Payout payout = payoutRepository.findById(payoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Payout not found"));

        if (payout.getStatus() != PayoutStatus.QC) {
            throw new ValidationException("Only QC payouts can be marked ready");
        }

        payout.setStatus(PayoutStatus.READY);
        Payout saved = payoutRepository.save(payout);

        log.info("Payout marked ready: id={}", payoutId);
        return toDto(saved);
    }

    /**
     * Release a payout (admin).
     */
    @Transactional
    public PayoutDto releasePayout(Long payoutId, String transactionId) {
        Payout payout = payoutRepository.findById(payoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Payout not found"));

        if (payout.getStatus() != PayoutStatus.READY) {
            throw new ValidationException("Only ready payouts can be released");
        }

        payout.setStatus(PayoutStatus.RELEASED);
        payout.setReleasedAt(Instant.now());
        payout.setTransactionId(transactionId);

        Payout saved = payoutRepository.save(payout);

        // Update reviewer's total earnings
        ReviewerProfile reviewer = payout.getReviewer();
        reviewer.setTotalEarnings(reviewer.getTotalEarnings() + payout.getAmount());
        reviewerProfileRepository.save(reviewer);

        log.info("Payout released: id={}, transactionId={}", payoutId, transactionId);
        return toDto(saved);
    }

    /**
     * Get payout by ID.
     */
    @Transactional(readOnly = true)
    public PayoutDto getPayoutById(Long payoutId) {
        Payout payout = payoutRepository.findById(payoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Payout not found"));
        return toDto(payout);
    }

    /**
     * Get reviewer profile or throw.
     */
    private ReviewerProfile getReviewerProfile(User user) {
        return reviewerProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer profile not found"));
    }

    /**
     * Convert entity to DTO.
     */
    private PayoutDto toDto(Payout payout) {
        return PayoutDto.builder()
                .id(payout.getId())
                .reviewerId(payout.getReviewer().getId())
                .reviewerName(payout.getReviewer().getName())
                .amount(payout.getAmount())
                .tasksIncluded(payout.getTasksIncluded())
                .status(payout.getStatus().name())
                .createdAt(payout.getCreatedAt())
                .releasedAt(payout.getReleasedAt())
                .build();
    }
}
