package com.contentdiagnostics.payouts.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.auth.entity.UserRole;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.common.exception.ValidationException;
import com.contentdiagnostics.payouts.dto.PayoutDto;
import com.contentdiagnostics.payouts.dto.RequestPayoutRequest;
import com.contentdiagnostics.payouts.entity.Payout;
import com.contentdiagnostics.payouts.entity.PayoutStatus;
import com.contentdiagnostics.payouts.repository.PayoutRepository;
import com.contentdiagnostics.notifications.service.NotificationService;
import com.contentdiagnostics.reviewers.entity.PayoutMethod;
import com.contentdiagnostics.reviewers.entity.ReviewerProfile;
import com.contentdiagnostics.reviewers.repository.ReviewerProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PayoutService")
class PayoutServiceTest {

    @Mock
    private PayoutRepository payoutRepository;

    @Mock
    private ReviewerProfileRepository reviewerProfileRepository;

    @Mock
    private NotificationService notificationService;

    private PayoutService payoutService;

    private User testUser;
    private ReviewerProfile testReviewer;
    private Payout testPayout;

    @BeforeEach
    void setUp() {
        // Manually create service with test config value
        payoutService = new PayoutService(payoutRepository, reviewerProfileRepository, notificationService, 10.0);

        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("reviewer@example.com");
        testUser.setRole(UserRole.REVIEWER);

        testReviewer = ReviewerProfile.builder()
                .id(1L)
                .user(testUser)
                .name("Test Reviewer")
                .firstName("Test")
                .lastName("Reviewer")
                .language("English")
                .qualificationPassed(true)
                .qualityScore(85)
                .queueLocked(false)
                .tasksCompleted(100)
                .tasksApproved(95)
                .totalEarnings(500.0)
                .pendingEarnings(50.0)
                .payoutMethod(PayoutMethod.PAYPAL)
                .build();

        testPayout = Payout.builder()
                .id(1L)
                .reviewer(testReviewer)
                .amount(25.0)
                .tasksIncluded(5)
                .status(PayoutStatus.PENDING)
                .createdAt(Instant.now())
                .build();
    }

    @Nested
    @DisplayName("getReviewerPayouts")
    class GetReviewerPayouts {

        @Test
        @DisplayName("should return payouts for reviewer")
        void shouldReturnPayoutsForReviewer() {
            when(reviewerProfileRepository.findByUser(testUser))
                    .thenReturn(Optional.of(testReviewer));
            when(payoutRepository.findByReviewerOrderByCreatedAtDesc(testReviewer))
                    .thenReturn(List.of(testPayout));

            List<PayoutDto> payouts = payoutService.getReviewerPayouts(testUser);

            assertThat(payouts).hasSize(1);
            assertThat(payouts.get(0).getId()).isEqualTo(testPayout.getId());
            assertThat(payouts.get(0).getAmount()).isEqualTo(25.0);
        }

        @Test
        @DisplayName("should return empty list for new reviewer")
        void shouldReturnEmptyListForNewReviewer() {
            when(reviewerProfileRepository.findByUser(testUser))
                    .thenReturn(Optional.of(testReviewer));
            when(payoutRepository.findByReviewerOrderByCreatedAtDesc(testReviewer))
                    .thenReturn(Collections.emptyList());

            List<PayoutDto> payouts = payoutService.getReviewerPayouts(testUser);

            assertThat(payouts).isEmpty();
        }

        @Test
        @DisplayName("should throw when reviewer profile not found")
        void shouldThrowWhenReviewerNotFound() {
            when(reviewerProfileRepository.findByUser(testUser))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> payoutService.getReviewerPayouts(testUser))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Reviewer profile");
        }
    }

    @Nested
    @DisplayName("requestPayout")
    class RequestPayout {

        private RequestPayoutRequest validRequest;

        @BeforeEach
        void setUp() {
            validRequest = new RequestPayoutRequest();
            validRequest.setAmount(25.0);
        }

        @Test
        @DisplayName("should create payout with PENDING status")
        void shouldCreatePayoutWithPendingStatus() {
            when(reviewerProfileRepository.findByUser(testUser))
                    .thenReturn(Optional.of(testReviewer));
            when(payoutRepository.save(any(Payout.class))).thenAnswer(i -> {
                Payout p = i.getArgument(0);
                p.setId(1L);
                return p;
            });

            PayoutDto result = payoutService.requestPayout(testUser, validRequest);

            assertThat(result).isNotNull();
            assertThat(result.getStatus()).isEqualTo("PENDING");

            ArgumentCaptor<Payout> payoutCaptor = ArgumentCaptor.forClass(Payout.class);
            verify(payoutRepository).save(payoutCaptor.capture());
            assertThat(payoutCaptor.getValue().getStatus()).isEqualTo(PayoutStatus.PENDING);
            assertThat(payoutCaptor.getValue().getAmount()).isEqualTo(25.0);
        }

        @Test
        @DisplayName("should throw when below minimum amount")
        void shouldThrowWhenBelowMinimum() {
            validRequest.setAmount(5.0);
            when(reviewerProfileRepository.findByUser(testUser))
                    .thenReturn(Optional.of(testReviewer));

            assertThatThrownBy(() -> payoutService.requestPayout(testUser, validRequest))
                    .isInstanceOf(ValidationException.class)
                    .hasMessageContaining("Minimum payout");
        }

        @Test
        @DisplayName("should throw when payout method not configured")
        void shouldThrowWhenPayoutMethodNotConfigured() {
            testReviewer.setPayoutMethod(null);
            when(reviewerProfileRepository.findByUser(testUser))
                    .thenReturn(Optional.of(testReviewer));

            assertThatThrownBy(() -> payoutService.requestPayout(testUser, validRequest))
                    .isInstanceOf(ValidationException.class)
                    .hasMessageContaining("Payout method not configured");
        }

        @Test
        @DisplayName("should throw when exceeds pending earnings")
        void shouldThrowWhenExceedsPendingEarnings() {
            validRequest.setAmount(100.0); // More than pending earnings (50.0)
            when(reviewerProfileRepository.findByUser(testUser))
                    .thenReturn(Optional.of(testReviewer));

            assertThatThrownBy(() -> payoutService.requestPayout(testUser, validRequest))
                    .isInstanceOf(ValidationException.class)
                    .hasMessageContaining("exceeds pending earnings");
        }

        @Test
        @DisplayName("should deduct from pending earnings")
        void shouldDeductFromPendingEarnings() {
            when(reviewerProfileRepository.findByUser(testUser))
                    .thenReturn(Optional.of(testReviewer));
            when(payoutRepository.save(any(Payout.class))).thenAnswer(i -> {
                Payout p = i.getArgument(0);
                p.setId(1L);
                return p;
            });

            payoutService.requestPayout(testUser, validRequest);

            ArgumentCaptor<ReviewerProfile> profileCaptor = ArgumentCaptor.forClass(ReviewerProfile.class);
            verify(reviewerProfileRepository).save(profileCaptor.capture());
            assertThat(profileCaptor.getValue().getPendingEarnings()).isEqualTo(25.0); // 50 - 25
        }
    }

    @Nested
    @DisplayName("advanceToQc")
    class AdvanceToQc {

        @Test
        @DisplayName("should advance payout to QC status")
        void shouldAdvanceToQcStatus() {
            when(payoutRepository.findById(testPayout.getId()))
                    .thenReturn(Optional.of(testPayout));
            when(payoutRepository.save(any(Payout.class))).thenAnswer(i -> i.getArgument(0));

            PayoutDto result = payoutService.advanceToQc(testPayout.getId());

            assertThat(result.getStatus()).isEqualTo("QC");
            verify(payoutRepository).save(any(Payout.class));
        }

        @Test
        @DisplayName("should throw when payout not found")
        void shouldThrowWhenNotFound() {
            when(payoutRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> payoutService.advanceToQc(99L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("should throw when payout not in PENDING status")
        void shouldThrowWhenNotPending() {
            testPayout.setStatus(PayoutStatus.RELEASED);
            when(payoutRepository.findById(testPayout.getId()))
                    .thenReturn(Optional.of(testPayout));

            assertThatThrownBy(() -> payoutService.advanceToQc(testPayout.getId()))
                    .isInstanceOf(ValidationException.class)
                    .hasMessageContaining("pending payouts");
        }
    }

    @Nested
    @DisplayName("markReady")
    class MarkReady {

        @Test
        @DisplayName("should mark payout as READY")
        void shouldMarkAsReady() {
            testPayout.setStatus(PayoutStatus.QC);
            when(payoutRepository.findById(testPayout.getId()))
                    .thenReturn(Optional.of(testPayout));
            when(payoutRepository.save(any(Payout.class))).thenAnswer(i -> i.getArgument(0));

            PayoutDto result = payoutService.markReady(testPayout.getId());

            assertThat(result.getStatus()).isEqualTo("READY");
        }

        @Test
        @DisplayName("should throw when payout not in QC status")
        void shouldThrowWhenNotQc() {
            testPayout.setStatus(PayoutStatus.PENDING);
            when(payoutRepository.findById(testPayout.getId()))
                    .thenReturn(Optional.of(testPayout));

            assertThatThrownBy(() -> payoutService.markReady(testPayout.getId()))
                    .isInstanceOf(ValidationException.class)
                    .hasMessageContaining("QC payouts");
        }
    }

    @Nested
    @DisplayName("releasePayout")
    class ReleasePayout {

        @Test
        @DisplayName("should set status to RELEASED")
        void shouldSetStatusToReleased() {
            testPayout.setStatus(PayoutStatus.READY);
            when(payoutRepository.findById(testPayout.getId()))
                    .thenReturn(Optional.of(testPayout));
            when(payoutRepository.save(any(Payout.class))).thenAnswer(i -> i.getArgument(0));

            PayoutDto result = payoutService.releasePayout(testPayout.getId(), "txn_12345");

            assertThat(result.getStatus()).isEqualTo("RELEASED");
        }

        @Test
        @DisplayName("should record transaction ID")
        void shouldRecordTransactionId() {
            testPayout.setStatus(PayoutStatus.READY);
            when(payoutRepository.findById(testPayout.getId()))
                    .thenReturn(Optional.of(testPayout));
            when(payoutRepository.save(any(Payout.class))).thenAnswer(i -> i.getArgument(0));

            payoutService.releasePayout(testPayout.getId(), "txn_12345");

            ArgumentCaptor<Payout> captor = ArgumentCaptor.forClass(Payout.class);
            verify(payoutRepository).save(captor.capture());
            assertThat(captor.getValue().getTransactionId()).isEqualTo("txn_12345");
            assertThat(captor.getValue().getReleasedAt()).isNotNull();
        }

        @Test
        @DisplayName("should update reviewer total earnings")
        void shouldUpdateReviewerTotalEarnings() {
            testPayout.setStatus(PayoutStatus.READY);
            when(payoutRepository.findById(testPayout.getId()))
                    .thenReturn(Optional.of(testPayout));
            when(payoutRepository.save(any(Payout.class))).thenAnswer(i -> i.getArgument(0));

            payoutService.releasePayout(testPayout.getId(), "txn_12345");

            ArgumentCaptor<ReviewerProfile> profileCaptor = ArgumentCaptor.forClass(ReviewerProfile.class);
            verify(reviewerProfileRepository).save(profileCaptor.capture());
            // Original totalEarnings (500.0) + payout amount (25.0) = 525.0
            assertThat(profileCaptor.getValue().getTotalEarnings()).isEqualTo(525.0);
        }

        @Test
        @DisplayName("should throw when payout not READY")
        void shouldThrowWhenNotReady() {
            testPayout.setStatus(PayoutStatus.QC);
            when(payoutRepository.findById(testPayout.getId()))
                    .thenReturn(Optional.of(testPayout));

            assertThatThrownBy(() -> payoutService.releasePayout(testPayout.getId(), "txn_12345"))
                    .isInstanceOf(ValidationException.class)
                    .hasMessageContaining("ready payouts");
        }
    }

    @Nested
    @DisplayName("getPayoutById")
    class GetPayoutById {

        @Test
        @DisplayName("should return payout by ID")
        void shouldReturnPayoutById() {
            when(payoutRepository.findById(testPayout.getId()))
                    .thenReturn(Optional.of(testPayout));

            PayoutDto result = payoutService.getPayoutById(testPayout.getId());

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(testPayout.getId());
        }

        @Test
        @DisplayName("should throw when not found")
        void shouldThrowWhenNotFound() {
            when(payoutRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> payoutService.getPayoutById(99L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
