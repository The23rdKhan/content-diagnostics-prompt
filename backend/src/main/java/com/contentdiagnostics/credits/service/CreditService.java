package com.contentdiagnostics.credits.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.common.exception.BadRequestException;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.creators.entity.CreatorProfile;
import com.contentdiagnostics.creators.repository.CreatorProfileRepository;
import com.contentdiagnostics.credits.dto.CreditBalanceDto;
import com.contentdiagnostics.credits.dto.CreditBundleDto;
import com.contentdiagnostics.credits.dto.CreditTransactionDto;
import com.contentdiagnostics.credits.entity.CreditBundle;
import com.contentdiagnostics.credits.entity.CreditTransaction;
import com.contentdiagnostics.credits.entity.CreditTransactionType;
import com.contentdiagnostics.credits.repository.CreditTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing creator credits.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CreditService {

    private final CreatorProfileRepository creatorProfileRepository;
    private final CreditTransactionRepository transactionRepository;

    // Credits required per video (standard video < 30 min)
    public static final int CREDITS_PER_VIDEO = 5;

    /**
     * Get credit balance and usage info for a creator.
     */
    @Transactional(readOnly = true)
    public CreditBalanceDto getCreditBalance(User user) {
        CreatorProfile profile = getCreatorProfile(user);

        // Get usage stats for this month
        Instant monthStart = Instant.now().truncatedTo(ChronoUnit.DAYS).minus(30, ChronoUnit.DAYS);
        Instant now = Instant.now();

        int usedThisMonth = transactionRepository.sumUsedCredits(profile, monthStart, now);
        int purchasedThisMonth = transactionRepository.sumPurchasedCredits(profile, monthStart, now);

        return CreditBalanceDto.builder()
                .balance(profile.getRemainingCredits())
                .creditsPerVideo(CREDITS_PER_VIDEO)
                .videosAvailable(profile.getRemainingCredits() / CREDITS_PER_VIDEO)
                .usedThisMonth(usedThisMonth)
                .purchasedThisMonth(purchasedThisMonth)
                .build();
    }

    /**
     * Get available credit bundles for purchase.
     */
    public List<CreditBundleDto> getAvailableBundles() {
        return CreditBundle.getAvailableBundles().stream()
                .map(this::toBundleDto)
                .collect(Collectors.toList());
    }

    /**
     * Get credit transaction history.
     */
    @Transactional(readOnly = true)
    public Page<CreditTransactionDto> getTransactionHistory(User user, int page, int size) {
        CreatorProfile profile = getCreatorProfile(user);
        Page<CreditTransaction> transactions = transactionRepository
                .findByCreatorOrderByCreatedAtDesc(profile, PageRequest.of(page, size));
        return transactions.map(this::toTransactionDto);
    }

    /**
     * Add credits from a purchase.
     */
    @Transactional
    public CreditTransaction addPurchasedCredits(CreatorProfile creator, String bundleId,
                                                  String paymentIntentId, BigDecimal pricePaid) {
        CreditBundle bundle = CreditBundle.findById(bundleId);
        if (bundle == null) {
            throw new BadRequestException("Invalid bundle ID: " + bundleId);
        }

        int newBalance = creator.getRemainingCredits() + bundle.getCredits();
        creatorProfileRepository.addCredits(creator.getId(), bundle.getCredits());

        CreditTransaction tx = CreditTransaction.builder()
                .creator(creator)
                .type(CreditTransactionType.PURCHASE)
                .amount(bundle.getCredits())
                .balanceAfter(newBalance)
                .description("Purchased " + bundle.getName())
                .stripePaymentIntentId(paymentIntentId)
                .pricePaid(pricePaid)
                .bundleId(bundleId)
                .build();

        log.info("Added {} credits for creator {} from bundle {}", bundle.getCredits(), creator.getId(), bundleId);

        return transactionRepository.save(tx);
    }

    /**
     * Deduct credits for video submission.
     * Returns true if successful, throws exception if insufficient credits.
     */
    @Transactional
    public CreditTransaction deductCreditsForVideo(User user, Long jobId, int creditsRequired) {
        CreatorProfile profile = getCreatorProfile(user);

        if (profile.getRemainingCredits() < creditsRequired) {
            throw new BadRequestException("Insufficient credits. Required: " + creditsRequired +
                    ", Available: " + profile.getRemainingCredits());
        }

        int updated = creatorProfileRepository.deductCredits(profile.getId(), creditsRequired);
        if (updated == 0) {
            throw new BadRequestException("Failed to deduct credits - concurrent modification");
        }

        int newBalance = profile.getRemainingCredits() - creditsRequired;

        CreditTransaction tx = CreditTransaction.builder()
                .creator(profile)
                .type(CreditTransactionType.USAGE)
                .amount(-creditsRequired)
                .balanceAfter(newBalance)
                .description("Video submission")
                .jobId(jobId)
                .build();

        log.info("Deducted {} credits for job {} from creator {}", creditsRequired, jobId, profile.getId());

        return transactionRepository.save(tx);
    }

    /**
     * Refund credits for cancelled job (by User).
     */
    @Transactional
    public CreditTransaction refundCredits(User user, Long jobId, int credits, String reason) {
        CreatorProfile creator = getCreatorProfile(user);
        return refundCredits(creator, jobId, credits, reason);
    }

    /**
     * Refund credits for cancelled job.
     */
    @Transactional
    public CreditTransaction refundCredits(CreatorProfile creator, Long jobId, int credits, String reason) {
        int newBalance = creator.getRemainingCredits() + credits;
        creatorProfileRepository.addCredits(creator.getId(), credits);

        CreditTransaction tx = CreditTransaction.builder()
                .creator(creator)
                .type(CreditTransactionType.REFUND)
                .amount(credits)
                .balanceAfter(newBalance)
                .description("Refund: " + reason)
                .jobId(jobId)
                .reason(reason)
                .build();

        log.info("Refunded {} credits for job {} to creator {}: {}", credits, jobId, creator.getId(), reason);

        return transactionRepository.save(tx);
    }

    /**
     * Issue promotional credits (sign-up bonus, etc).
     */
    @Transactional
    public CreditTransaction issuePromoCredits(CreatorProfile creator, int credits, String reason) {
        int newBalance = creator.getRemainingCredits() + credits;
        creatorProfileRepository.addCredits(creator.getId(), credits);

        CreditTransaction tx = CreditTransaction.builder()
                .creator(creator)
                .type(CreditTransactionType.PROMO)
                .amount(credits)
                .balanceAfter(newBalance)
                .description("Promotional: " + reason)
                .reason(reason)
                .build();

        log.info("Issued {} promo credits to creator {}: {}", credits, creator.getId(), reason);

        return transactionRepository.save(tx);
    }

    /**
     * Check if user has enough credits for a video submission.
     */
    @Transactional(readOnly = true)
    public boolean hasEnoughCredits(User user, int creditsRequired) {
        CreatorProfile profile = getCreatorProfile(user);
        return profile.getRemainingCredits() >= creditsRequired;
    }

    /**
     * Check if a payment has already been processed (idempotency check).
     */
    @Transactional(readOnly = true)
    public boolean isPaymentAlreadyProcessed(String paymentIntentId) {
        return isExternalTransactionProcessed(paymentIntentId);
    }

    /**
     * Check if a credit transaction has already been recorded for an external reference.
     */
    @Transactional(readOnly = true)
    public boolean isExternalTransactionProcessed(String referenceId) {
        if (referenceId == null || referenceId.isEmpty()) {
            return false;
        }
        return transactionRepository.findByStripePaymentIntentId(referenceId).isPresent();
    }

    // --- Private helpers ---

    private CreatorProfile getCreatorProfile(User user) {
        return creatorProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Creator profile", user.getId().toString()));
    }

    private CreditBundleDto toBundleDto(CreditBundle bundle) {
        return CreditBundleDto.builder()
                .id(bundle.getId())
                .name(bundle.getName())
                .credits(bundle.getCredits())
                .price(bundle.getPrice())
                .description(bundle.getDescription())
                .popular(bundle.isPopular())
                .pricePerCredit(bundle.getPricePerCredit())
                .savingsPercent(bundle.getSavingsPercent())
                .build();
    }

    private CreditTransactionDto toTransactionDto(CreditTransaction tx) {
        return CreditTransactionDto.builder()
                .id(tx.getId())
                .type(tx.getType().name())
                .amount(tx.getAmount())
                .balanceAfter(tx.getBalanceAfter())
                .description(tx.getDescription())
                .createdAt(tx.getCreatedAt())
                .build();
    }

    public int getCreditsForPlanTier(String planTier) {
        if (planTier == null) {
            return 15;
        }
        return switch (planTier.toLowerCase()) {
            case "professional" -> 50;
            case "enterprise" -> 250;
            default -> 15;
        };
    }

    /**
     * Add subscription credits based on plan tier.
     */
    @Transactional
    public CreditTransaction addSubscriptionCredits(CreatorProfile creator, String planTier, String referenceId) {
        int credits = getCreditsForPlanTier(planTier);
        int newBalance = creator.getRemainingCredits() + credits;
        creatorProfileRepository.addCredits(creator.getId(), credits);
        creator.setRemainingCredits(newBalance);

        CreditTransaction tx = CreditTransaction.builder()
                .creator(creator)
                .type(CreditTransactionType.SUBSCRIPTION)
                .amount(credits)
                .balanceAfter(newBalance)
                .description("Subscription credits - " + (planTier == null ? "basic" : planTier))
                .stripePaymentIntentId(referenceId)
                .build();

        log.info("Added {} subscription credits for creator {} on plan {}", credits, creator.getId(), planTier);

        return transactionRepository.save(tx);
    }
}
