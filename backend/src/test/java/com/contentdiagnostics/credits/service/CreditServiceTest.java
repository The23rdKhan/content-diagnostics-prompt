package com.contentdiagnostics.credits.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.auth.entity.UserRole;
import com.contentdiagnostics.common.exception.BadRequestException;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.creators.entity.CreatorProfile;
import com.contentdiagnostics.creators.repository.CreatorProfileRepository;
import com.contentdiagnostics.credits.dto.CreditBalanceDto;
import com.contentdiagnostics.credits.dto.CreditBundleDto;
import com.contentdiagnostics.credits.entity.CreditTransaction;
import com.contentdiagnostics.credits.entity.CreditTransactionType;
import com.contentdiagnostics.credits.repository.CreditTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CreditService")
class CreditServiceTest {

    @Mock
    private CreatorProfileRepository creatorProfileRepository;

    @Mock
    private CreditTransactionRepository transactionRepository;

    @InjectMocks
    private CreditService creditService;

    private User testUser;
    private CreatorProfile creatorProfile;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("creator@example.com");
        testUser.setRole(UserRole.CREATOR);

        creatorProfile = new CreatorProfile();
        creatorProfile.setId(1L);
        creatorProfile.setUser(testUser);
        creatorProfile.setRemainingCredits(50);
    }

    @Nested
    @DisplayName("getCreditBalance")
    class GetCreditBalance {

        @Test
        @DisplayName("should return balance and usage for creator")
        void shouldReturnBalanceAndUsage() {
            when(creatorProfileRepository.findByUser(testUser)).thenReturn(Optional.of(creatorProfile));
            when(transactionRepository.sumUsedCredits(eq(creatorProfile), any(Instant.class), any(Instant.class)))
                    .thenReturn(15);
            when(transactionRepository.sumPurchasedCredits(eq(creatorProfile), any(Instant.class), any(Instant.class)))
                    .thenReturn(25);

            CreditBalanceDto balance = creditService.getCreditBalance(testUser);

            assertThat(balance.getBalance()).isEqualTo(50);
            assertThat(balance.getCreditsPerVideo()).isEqualTo(5);
            assertThat(balance.getVideosAvailable()).isEqualTo(10);
            assertThat(balance.getUsedThisMonth()).isEqualTo(15);
            assertThat(balance.getPurchasedThisMonth()).isEqualTo(25);
        }

        @Test
        @DisplayName("should throw when creator profile not found")
        void shouldThrowWhenProfileNotFound() {
            when(creatorProfileRepository.findByUser(testUser)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> creditService.getCreditBalance(testUser))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Creator profile");
        }
    }

    @Nested
    @DisplayName("getAvailableBundles")
    class GetAvailableBundles {

        @Test
        @DisplayName("should return list of credit bundles")
        void shouldReturnBundles() {
            List<CreditBundleDto> bundles = creditService.getAvailableBundles();

            assertThat(bundles).hasSize(4);
            assertThat(bundles).extracting("id")
                    .containsExactly("starter", "creator", "pro", "studio");
        }

        @Test
        @DisplayName("should mark creator pack as popular")
        void shouldMarkCreatorPackAsPopular() {
            List<CreditBundleDto> bundles = creditService.getAvailableBundles();

            CreditBundleDto creatorPack = bundles.stream()
                    .filter(b -> b.getId().equals("creator"))
                    .findFirst()
                    .orElseThrow();

            assertThat(creatorPack.getPopular()).isTrue();
            assertThat(creatorPack.getCredits()).isEqualTo(25);
        }
    }

    @Nested
    @DisplayName("addPurchasedCredits")
    class AddPurchasedCredits {

        @Test
        @DisplayName("should add credits and create transaction")
        void shouldAddCreditsAndCreateTransaction() {
            String bundleId = "creator";
            String paymentIntentId = "pi_test123";
            BigDecimal pricePaid = new BigDecimal("30.00");

            when(transactionRepository.save(any(CreditTransaction.class)))
                    .thenAnswer(i -> i.getArgument(0));

            CreditTransaction tx = creditService.addPurchasedCredits(
                    creatorProfile, bundleId, paymentIntentId, pricePaid);

            assertThat(tx.getType()).isEqualTo(CreditTransactionType.PURCHASE);
            assertThat(tx.getAmount()).isEqualTo(25); // creator pack = 25 credits
            assertThat(tx.getBalanceAfter()).isEqualTo(75); // 50 + 25
            assertThat(tx.getStripePaymentIntentId()).isEqualTo(paymentIntentId);

            verify(creatorProfileRepository).addCredits(creatorProfile.getId(), 25);
        }

        @Test
        @DisplayName("should throw for invalid bundle ID")
        void shouldThrowForInvalidBundleId() {
            assertThatThrownBy(() -> creditService.addPurchasedCredits(
                    creatorProfile, "invalid_bundle", "pi_test", BigDecimal.TEN))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Invalid bundle ID");
        }

        @Test
        @DisplayName("should record Stripe payment intent ID")
        void shouldRecordPaymentIntentId() {
            String paymentIntentId = "pi_unique_123";
            when(transactionRepository.save(any(CreditTransaction.class)))
                    .thenAnswer(i -> i.getArgument(0));

            CreditTransaction tx = creditService.addPurchasedCredits(
                    creatorProfile, "starter", paymentIntentId, new BigDecimal("15.00"));

            assertThat(tx.getStripePaymentIntentId()).isEqualTo(paymentIntentId);
            assertThat(tx.getBundleId()).isEqualTo("starter");
        }
    }

    @Nested
    @DisplayName("deductCreditsForVideo")
    class DeductCreditsForVideo {

        @Test
        @DisplayName("should deduct credits successfully")
        void shouldDeductCreditsSuccessfully() {
            when(creatorProfileRepository.findByUser(testUser)).thenReturn(Optional.of(creatorProfile));
            when(creatorProfileRepository.deductCredits(creatorProfile.getId(), 5)).thenReturn(1);
            when(transactionRepository.save(any(CreditTransaction.class)))
                    .thenAnswer(i -> i.getArgument(0));

            CreditTransaction tx = creditService.deductCreditsForVideo(testUser, 100L, 5);

            assertThat(tx.getType()).isEqualTo(CreditTransactionType.USAGE);
            assertThat(tx.getAmount()).isEqualTo(-5);
            assertThat(tx.getBalanceAfter()).isEqualTo(45);
            assertThat(tx.getJobId()).isEqualTo(100L);
        }

        @Test
        @DisplayName("should throw when insufficient credits")
        void shouldThrowWhenInsufficientCredits() {
            creatorProfile.setRemainingCredits(3);
            when(creatorProfileRepository.findByUser(testUser)).thenReturn(Optional.of(creatorProfile));

            assertThatThrownBy(() -> creditService.deductCreditsForVideo(testUser, 100L, 5))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Insufficient credits");
        }

        @Test
        @DisplayName("should throw on concurrent modification")
        void shouldThrowOnConcurrentModification() {
            when(creatorProfileRepository.findByUser(testUser)).thenReturn(Optional.of(creatorProfile));
            when(creatorProfileRepository.deductCredits(creatorProfile.getId(), 5)).thenReturn(0);

            assertThatThrownBy(() -> creditService.deductCreditsForVideo(testUser, 100L, 5))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("concurrent modification");
        }
    }

    @Nested
    @DisplayName("refundCredits")
    class RefundCredits {

        @Test
        @DisplayName("should refund credits and create transaction")
        void shouldRefundCreditsAndCreateTransaction() {
            when(creatorProfileRepository.findByUser(testUser)).thenReturn(Optional.of(creatorProfile));
            when(transactionRepository.save(any(CreditTransaction.class)))
                    .thenAnswer(i -> i.getArgument(0));

            CreditTransaction tx = creditService.refundCredits(testUser, 100L, 5, "Job cancelled");

            assertThat(tx.getType()).isEqualTo(CreditTransactionType.REFUND);
            assertThat(tx.getAmount()).isEqualTo(5);
            assertThat(tx.getBalanceAfter()).isEqualTo(55);
            assertThat(tx.getReason()).isEqualTo("Job cancelled");

            verify(creatorProfileRepository).addCredits(creatorProfile.getId(), 5);
        }

        @Test
        @DisplayName("should work with CreatorProfile directly")
        void shouldWorkWithCreatorProfileDirectly() {
            when(transactionRepository.save(any(CreditTransaction.class)))
                    .thenAnswer(i -> i.getArgument(0));

            CreditTransaction tx = creditService.refundCredits(creatorProfile, 200L, 10, "SLA breach");

            assertThat(tx.getAmount()).isEqualTo(10);
            assertThat(tx.getJobId()).isEqualTo(200L);
            verify(creatorProfileRepository).addCredits(creatorProfile.getId(), 10);
        }
    }

    @Nested
    @DisplayName("issuePromoCredits")
    class IssuePromoCredits {

        @Test
        @DisplayName("should issue promo credits with correct type")
        void shouldIssuePromoCreditsWithCorrectType() {
            when(transactionRepository.save(any(CreditTransaction.class)))
                    .thenAnswer(i -> i.getArgument(0));

            CreditTransaction tx = creditService.issuePromoCredits(creatorProfile, 20, "Welcome bonus");

            assertThat(tx.getType()).isEqualTo(CreditTransactionType.PROMO);
            assertThat(tx.getAmount()).isEqualTo(20);
            assertThat(tx.getBalanceAfter()).isEqualTo(70);
            assertThat(tx.getDescription()).contains("Promotional");

            verify(creatorProfileRepository).addCredits(creatorProfile.getId(), 20);
        }
    }

    @Nested
    @DisplayName("issueAdminCredits")
    class IssueAdminCredits {

        @Test
        @DisplayName("should issue admin credits with correct type")
        void shouldIssueAdminCreditsWithCorrectType() {
            when(transactionRepository.save(any(CreditTransaction.class)))
                    .thenAnswer(i -> i.getArgument(0));

            CreditTransaction tx = creditService.issueAdminCredits(creatorProfile, 15, "Support compensation");

            assertThat(tx.getType()).isEqualTo(CreditTransactionType.ADMIN_ISSUE);
            assertThat(tx.getAmount()).isEqualTo(15);
            assertThat(tx.getBalanceAfter()).isEqualTo(65);
            assertThat(tx.getDescription()).contains("Admin issued");
        }

        @Test
        @DisplayName("should handle null reason")
        void shouldHandleNullReason() {
            when(transactionRepository.save(any(CreditTransaction.class)))
                    .thenAnswer(i -> i.getArgument(0));

            CreditTransaction tx = creditService.issueAdminCredits(creatorProfile, 10, null);

            assertThat(tx.getDescription()).contains("No reason");
        }
    }

    @Nested
    @DisplayName("hasEnoughCredits")
    class HasEnoughCredits {

        @Test
        @DisplayName("should return true when sufficient credits")
        void shouldReturnTrueWhenSufficient() {
            when(creatorProfileRepository.findByUser(testUser)).thenReturn(Optional.of(creatorProfile));

            boolean result = creditService.hasEnoughCredits(testUser, 50);

            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("should return false when insufficient credits")
        void shouldReturnFalseWhenInsufficient() {
            when(creatorProfileRepository.findByUser(testUser)).thenReturn(Optional.of(creatorProfile));

            boolean result = creditService.hasEnoughCredits(testUser, 51);

            assertThat(result).isFalse();
        }
    }

    @Nested
    @DisplayName("isPaymentAlreadyProcessed")
    class IsPaymentAlreadyProcessed {

        @Test
        @DisplayName("should return true when payment exists")
        void shouldReturnTrueWhenPaymentExists() {
            when(transactionRepository.findByStripePaymentIntentId("pi_existing"))
                    .thenReturn(Optional.of(new CreditTransaction()));

            boolean result = creditService.isPaymentAlreadyProcessed("pi_existing");

            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("should return false when payment not found")
        void shouldReturnFalseWhenNotFound() {
            when(transactionRepository.findByStripePaymentIntentId("pi_new"))
                    .thenReturn(Optional.empty());

            boolean result = creditService.isPaymentAlreadyProcessed("pi_new");

            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("should return false for null reference")
        void shouldReturnFalseForNullReference() {
            boolean result = creditService.isExternalTransactionProcessed(null);

            assertThat(result).isFalse();
            verify(transactionRepository, never()).findByStripePaymentIntentId(any());
        }
    }

    @Nested
    @DisplayName("addSubscriptionCredits")
    class AddSubscriptionCredits {

        @Test
        @DisplayName("should add correct credits for basic plan (15)")
        void shouldAddCreditsForBasicPlan() {
            when(transactionRepository.save(any(CreditTransaction.class)))
                    .thenAnswer(i -> i.getArgument(0));

            CreditTransaction tx = creditService.addSubscriptionCredits(creatorProfile, "basic", "sub_123");

            assertThat(tx.getAmount()).isEqualTo(15);
            assertThat(tx.getType()).isEqualTo(CreditTransactionType.SUBSCRIPTION);
            verify(creatorProfileRepository).addCredits(creatorProfile.getId(), 15);
        }

        @Test
        @DisplayName("should add correct credits for professional plan (50)")
        void shouldAddCreditsForProfessionalPlan() {
            when(transactionRepository.save(any(CreditTransaction.class)))
                    .thenAnswer(i -> i.getArgument(0));

            CreditTransaction tx = creditService.addSubscriptionCredits(creatorProfile, "professional", "sub_456");

            assertThat(tx.getAmount()).isEqualTo(50);
            verify(creatorProfileRepository).addCredits(creatorProfile.getId(), 50);
        }

        @Test
        @DisplayName("should add correct credits for enterprise plan (250)")
        void shouldAddCreditsForEnterprisePlan() {
            when(transactionRepository.save(any(CreditTransaction.class)))
                    .thenAnswer(i -> i.getArgument(0));

            CreditTransaction tx = creditService.addSubscriptionCredits(creatorProfile, "enterprise", "sub_789");

            assertThat(tx.getAmount()).isEqualTo(250);
            verify(creatorProfileRepository).addCredits(creatorProfile.getId(), 250);
        }

        @Test
        @DisplayName("should default to basic credits for null plan tier")
        void shouldDefaultToBasicForNullPlanTier() {
            when(transactionRepository.save(any(CreditTransaction.class)))
                    .thenAnswer(i -> i.getArgument(0));

            CreditTransaction tx = creditService.addSubscriptionCredits(creatorProfile, null, "sub_default");

            assertThat(tx.getAmount()).isEqualTo(15);
            assertThat(tx.getDescription()).contains("basic");
        }
    }

    @Nested
    @DisplayName("getCreditsForPlanTier")
    class GetCreditsForPlanTier {

        @Test
        @DisplayName("should return 15 for basic")
        void shouldReturn15ForBasic() {
            assertThat(creditService.getCreditsForPlanTier("basic")).isEqualTo(15);
        }

        @Test
        @DisplayName("should return 50 for professional")
        void shouldReturn50ForProfessional() {
            assertThat(creditService.getCreditsForPlanTier("professional")).isEqualTo(50);
        }

        @Test
        @DisplayName("should return 250 for enterprise")
        void shouldReturn250ForEnterprise() {
            assertThat(creditService.getCreditsForPlanTier("enterprise")).isEqualTo(250);
        }

        @Test
        @DisplayName("should return 15 for null")
        void shouldReturn15ForNull() {
            assertThat(creditService.getCreditsForPlanTier(null)).isEqualTo(15);
        }

        @Test
        @DisplayName("should be case insensitive")
        void shouldBeCaseInsensitive() {
            assertThat(creditService.getCreditsForPlanTier("PROFESSIONAL")).isEqualTo(50);
            assertThat(creditService.getCreditsForPlanTier("Professional")).isEqualTo(50);
        }
    }
}
