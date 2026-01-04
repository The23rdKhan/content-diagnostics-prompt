package com.contentdiagnostics.admin.service;

import com.contentdiagnostics.admin.dto.*;
import com.contentdiagnostics.admin.entity.LanguagePoolSettings;
import com.contentdiagnostics.admin.repository.LanguagePoolSettingsRepository;
import com.contentdiagnostics.audit.service.AuditService;
import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.auth.entity.UserRole;
import com.contentdiagnostics.auth.repository.UserRepository;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.creators.entity.CreatorProfile;
import com.contentdiagnostics.creators.repository.CreatorProfileRepository;
import com.contentdiagnostics.credits.entity.CreditTransactionType;
import com.contentdiagnostics.credits.service.CreditService;
import com.contentdiagnostics.jobs.entity.JobStatus;
import com.contentdiagnostics.jobs.repository.JobRepository;
import com.contentdiagnostics.notifications.repository.EmailLogRepository;
import com.contentdiagnostics.payouts.dto.PayoutDto;
import com.contentdiagnostics.payouts.entity.Payout;
import com.contentdiagnostics.payouts.entity.PayoutStatus;
import com.contentdiagnostics.payouts.repository.PayoutRepository;
import com.contentdiagnostics.reviewers.entity.ReviewerProfile;
import com.contentdiagnostics.reviewers.repository.ReviewerProfileRepository;
import com.contentdiagnostics.tasks.entity.Task;
import com.contentdiagnostics.tasks.entity.TaskStatus;
import com.contentdiagnostics.tasks.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.contentdiagnostics.common.util.SecurityUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminService")
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CreatorProfileRepository creatorProfileRepository;

    @Mock
    private ReviewerProfileRepository reviewerProfileRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private PayoutRepository payoutRepository;

    @Mock
    private AuditService auditService;

    @Mock
    private CreditService creditService;

    @Mock
    private LanguagePoolSettingsRepository languagePoolSettingsRepository;

    @Mock
    private EmailLogRepository emailLogRepository;

    private AdminService adminService;

    private User testAdmin;
    private User testCreatorUser;
    private User testReviewerUser;
    private CreatorProfile testCreatorProfile;
    private ReviewerProfile testReviewerProfile;
    private Payout testPayout;

    @BeforeEach
    void setUp() {
        // Manually construct AdminService with all dependencies
        adminService = new AdminService(
                userRepository,
                creatorProfileRepository,
                reviewerProfileRepository,
                jobRepository,
                taskRepository,
                payoutRepository,
                auditService,
                creditService,
                languagePoolSettingsRepository,
                emailLogRepository
        );

        testAdmin = new User();
        testAdmin.setId(1L);
        testAdmin.setEmail("admin@example.com");
        testAdmin.setRole(UserRole.ADMIN);

        testCreatorUser = new User();
        testCreatorUser.setId(2L);
        testCreatorUser.setEmail("creator@example.com");
        testCreatorUser.setRole(UserRole.CREATOR);

        testReviewerUser = new User();
        testReviewerUser.setId(3L);
        testReviewerUser.setEmail("reviewer@example.com");
        testReviewerUser.setRole(UserRole.REVIEWER);

        testCreatorProfile = CreatorProfile.builder()
                .id(1L)
                .user(testCreatorUser)
                .name("Test Creator")
                .planTier("professional")
                .remainingCredits(50)
                .createdAt(Instant.now())
                .build();

        testReviewerProfile = ReviewerProfile.builder()
                .id(1L)
                .user(testReviewerUser)
                .name("Test Reviewer")
                .firstName("Test")
                .lastName("Reviewer")
                .language("English")
                .qualificationPassed(true)
                .qualityScore(85)
                .queueLocked(false)
                .strikes(0)
                .tasksCompleted(100)
                .tasksApproved(95)
                .totalEarnings(500.0)
                .pendingEarnings(50.0)
                .createdAt(Instant.now())
                .build();

        testPayout = Payout.builder()
                .id(1L)
                .reviewer(testReviewerProfile)
                .amount(25.0)
                .tasksIncluded(5)
                .status(PayoutStatus.READY)
                .createdAt(Instant.now())
                .build();
    }

    @Nested
    @DisplayName("getKpis")
    class GetKpis {

        @Test
        @DisplayName("should return correct counts for creators and reviewers")
        void shouldReturnCorrectCounts() {
            when(userRepository.countByRole(UserRole.CREATOR)).thenReturn(100L);
            when(userRepository.countByRole(UserRole.REVIEWER)).thenReturn(50L);
            when(reviewerProfileRepository.countActiveByLanguage("English")).thenReturn(30L);
            when(taskRepository.countByStatus(TaskStatus.AVAILABLE)).thenReturn(0L);
            when(jobRepository.countByStatusIn(anyList())).thenReturn(0L);

            KpiResponse kpis = adminService.getKpis();

            assertThat(kpis.getTotalCreators()).isEqualTo(100);
            assertThat(kpis.getTotalReviewers()).isEqualTo(50);
            assertThat(kpis.getActiveReviewers()).isEqualTo(30);
        }

        @Test
        @DisplayName("should count pending tasks correctly")
        void shouldCountPendingTasks() {
            when(userRepository.countByRole(any())).thenReturn(0L);
            when(reviewerProfileRepository.countActiveByLanguage("English")).thenReturn(0L);
            when(taskRepository.countByStatus(TaskStatus.AVAILABLE)).thenReturn(2L);
            when(jobRepository.countByStatusIn(anyList())).thenReturn(0L);

            KpiResponse kpis = adminService.getKpis();

            assertThat(kpis.getPendingTasks()).isEqualTo(2);
        }
    }

    @Nested
    @DisplayName("getCapacity")
    class GetCapacity {

        @Test
        @DisplayName("should return language pool data from repository")
        void shouldReturnLanguagePoolData() {
            LanguagePoolSettings englishPool = LanguagePoolSettings.builder()
                    .id(1L)
                    .languageCode("en")
                    .displayName("English (Global)")
                    .currentSla("24h")
                    .maxReviewersPerVideo(5)
                    .checkoutEnabled(true)
                    .liveAddonEnabled(true)
                    .active(true)
                    .build();

            when(languagePoolSettingsRepository.findByActiveTrueOrderByDisplayNameAsc())
                    .thenReturn(List.of(englishPool));
            when(reviewerProfileRepository.countActiveByLanguage("English")).thenReturn(25L);
            when(jobRepository.countActiveByLanguage("English")).thenReturn(10L);

            CapacityResponse capacity = adminService.getCapacity();

            assertThat(capacity.getLanguagePools()).hasSize(1);
            assertThat(capacity.getLanguagePools().get(0).getCode()).isEqualTo("en");
            assertThat(capacity.getLanguagePools().get(0).getActiveReviewers()).isEqualTo(25);
            assertThat(capacity.getLanguagePools().get(0).getPendingTasks()).isEqualTo(10);
            assertThat(capacity.getLanguagePools().get(0).getCurrentSLA()).isEqualTo("24h");
        }
    }

    @Nested
    @DisplayName("getReviewers")
    class GetReviewers {

        @Test
        @DisplayName("should return paginated list")
        void shouldReturnPaginatedList() {
            Page<ReviewerProfile> page = new PageImpl<>(List.of(testReviewerProfile));
            when(reviewerProfileRepository.findAll(PageRequest.of(0, 10))).thenReturn(page);

            List<AdminReviewerDto> reviewers = adminService.getReviewers(0, 10);

            assertThat(reviewers).hasSize(1);
            assertThat(reviewers.get(0).getId()).isEqualTo(testReviewerProfile.getId());
            assertThat(reviewers.get(0).getName()).isEqualTo("Test Reviewer");
        }

        @Test
        @DisplayName("should map DTO correctly")
        void shouldMapDtoCorrectly() {
            Page<ReviewerProfile> page = new PageImpl<>(List.of(testReviewerProfile));
            when(reviewerProfileRepository.findAll(PageRequest.of(0, 10))).thenReturn(page);

            List<AdminReviewerDto> reviewers = adminService.getReviewers(0, 10);

            AdminReviewerDto dto = reviewers.get(0);
            assertThat(dto.getEmail()).isEqualTo("reviewer@example.com");
            assertThat(dto.getLanguage()).isEqualTo("English");
            assertThat(dto.getQualityScore()).isEqualTo(85);
            assertThat(dto.getStatus()).isEqualTo("active");
            assertThat(dto.getQualificationStatus()).isEqualTo("passed");
        }
    }

    @Nested
    @DisplayName("updateReviewer")
    class UpdateReviewer {

        @Test
        @DisplayName("should update fields selectively")
        void shouldUpdateFieldsSelectively() {
            try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
                mockedSecurityUtils.when(SecurityUtils::getCurrentUser).thenReturn(testAdmin);

                when(reviewerProfileRepository.findById(testReviewerProfile.getId()))
                        .thenReturn(Optional.of(testReviewerProfile));
                when(reviewerProfileRepository.save(any(ReviewerProfile.class)))
                        .thenAnswer(i -> i.getArgument(0));

                UpdateReviewerRequest request = new UpdateReviewerRequest();
                request.setStrikes(2);

                AdminReviewerDto result = adminService.updateReviewer(testReviewerProfile.getId(), request);

                assertThat(result.getStrikes()).isEqualTo(2);
                verify(reviewerProfileRepository).save(any(ReviewerProfile.class));
            }
        }

        @Test
        @DisplayName("should log audit with old and new values")
        void shouldLogAudit() {
            try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
                mockedSecurityUtils.when(SecurityUtils::getCurrentUser).thenReturn(testAdmin);

                when(reviewerProfileRepository.findById(testReviewerProfile.getId()))
                        .thenReturn(Optional.of(testReviewerProfile));
                when(reviewerProfileRepository.save(any(ReviewerProfile.class)))
                        .thenAnswer(i -> i.getArgument(0));

                UpdateReviewerRequest request = new UpdateReviewerRequest();
                request.setQualityScore(70);

                adminService.updateReviewer(testReviewerProfile.getId(), request);

                verify(auditService).recordAdminAction(
                        eq(testAdmin),
                        eq("REVIEWER_UPDATE"),
                        eq("REVIEWER"),
                        eq(testReviewerProfile.getId()),
                        anyString(),
                        anyMap(),
                        anyMap()
                );
            }
        }

        @Test
        @DisplayName("should throw when reviewer not found")
        void shouldThrowWhenNotFound() {
            try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
                mockedSecurityUtils.when(SecurityUtils::getCurrentUser).thenReturn(testAdmin);

                when(reviewerProfileRepository.findById(99L)).thenReturn(Optional.empty());

                UpdateReviewerRequest request = new UpdateReviewerRequest();

                assertThatThrownBy(() -> adminService.updateReviewer(99L, request))
                        .isInstanceOf(ResourceNotFoundException.class);
            }
        }
    }

    @Nested
    @DisplayName("getCreators")
    class GetCreators {

        @Test
        @DisplayName("should return paginated list")
        void shouldReturnPaginatedList() {
            Page<CreatorProfile> page = new PageImpl<>(List.of(testCreatorProfile));
            when(creatorProfileRepository.findAll(PageRequest.of(0, 10))).thenReturn(page);

            List<AdminCreatorDto> creators = adminService.getCreators(0, 10);

            assertThat(creators).hasSize(1);
            assertThat(creators.get(0).getId()).isEqualTo(testCreatorProfile.getId());
            assertThat(creators.get(0).getName()).isEqualTo("Test Creator");
        }
    }

    @Nested
    @DisplayName("issueCredits")
    class IssueCredits {

        @Test
        @DisplayName("should issue admin credits by default")
        void shouldIssueAdminCreditsByDefault() {
            try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
                mockedSecurityUtils.when(SecurityUtils::getCurrentUser).thenReturn(testAdmin);

                when(creatorProfileRepository.findById(testCreatorProfile.getId()))
                        .thenReturn(Optional.of(testCreatorProfile));
                when(creatorProfileRepository.findById(testCreatorProfile.getId()))
                        .thenReturn(Optional.of(testCreatorProfile));

                IssueCreditRequest request = new IssueCreditRequest();
                request.setCredits(100);
                request.setReason("Support credit");

                adminService.issueCredits(testCreatorProfile.getId(), request);

                verify(creditService).issueAdminCredits(testCreatorProfile, 100, "Support credit");
            }
        }

        @Test
        @DisplayName("should issue promo credits when type specified")
        void shouldIssuePromoCreditsByType() {
            try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
                mockedSecurityUtils.when(SecurityUtils::getCurrentUser).thenReturn(testAdmin);

                when(creatorProfileRepository.findById(testCreatorProfile.getId()))
                        .thenReturn(Optional.of(testCreatorProfile));
                when(creatorProfileRepository.findById(testCreatorProfile.getId()))
                        .thenReturn(Optional.of(testCreatorProfile));

                IssueCreditRequest request = new IssueCreditRequest();
                request.setCredits(50);
                request.setReason("Launch promo");
                request.setType(CreditTransactionType.PROMO);

                adminService.issueCredits(testCreatorProfile.getId(), request);

                verify(creditService).issuePromoCredits(testCreatorProfile, 50, "Launch promo");
            }
        }

        @Test
        @DisplayName("should log audit correctly")
        void shouldLogAudit() {
            try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
                mockedSecurityUtils.when(SecurityUtils::getCurrentUser).thenReturn(testAdmin);

                when(creatorProfileRepository.findById(testCreatorProfile.getId()))
                        .thenReturn(Optional.of(testCreatorProfile));
                when(creatorProfileRepository.findById(testCreatorProfile.getId()))
                        .thenReturn(Optional.of(testCreatorProfile));

                IssueCreditRequest request = new IssueCreditRequest();
                request.setCredits(100);
                request.setReason("SLA miss");

                adminService.issueCredits(testCreatorProfile.getId(), request);

                verify(auditService).recordAdminAction(
                        eq(testAdmin),
                        eq("CREDIT_ISSUE"),
                        eq("CREATOR"),
                        eq(testCreatorProfile.getId()),
                        anyString(),
                        anyMap(),
                        anyMap()
                );
            }
        }
    }

    @Nested
    @DisplayName("releasePayout")
    class ReleasePayout {

        @Test
        @DisplayName("should update status to RELEASED")
        void shouldUpdateStatusToReleased() {
            try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
                mockedSecurityUtils.when(SecurityUtils::getCurrentUser).thenReturn(testAdmin);

                when(payoutRepository.findById(testPayout.getId()))
                        .thenReturn(Optional.of(testPayout));
                when(payoutRepository.save(any(Payout.class))).thenAnswer(i -> i.getArgument(0));

                PayoutDto result = adminService.releasePayout(testPayout.getId());

                assertThat(result.getStatus()).isEqualTo("released");
            }
        }

        @Test
        @DisplayName("should set releasedAt timestamp")
        void shouldSetReleasedAt() {
            try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
                mockedSecurityUtils.when(SecurityUtils::getCurrentUser).thenReturn(testAdmin);

                when(payoutRepository.findById(testPayout.getId()))
                        .thenReturn(Optional.of(testPayout));
                when(payoutRepository.save(any(Payout.class))).thenAnswer(i -> i.getArgument(0));

                adminService.releasePayout(testPayout.getId());

                assertThat(testPayout.getReleasedAt()).isNotNull();
            }
        }

        @Test
        @DisplayName("should call processPayout on reviewer")
        void shouldCallProcessPayout() {
            try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
                mockedSecurityUtils.when(SecurityUtils::getCurrentUser).thenReturn(testAdmin);

                when(payoutRepository.findById(testPayout.getId()))
                        .thenReturn(Optional.of(testPayout));
                when(payoutRepository.save(any(Payout.class))).thenAnswer(i -> i.getArgument(0));

                adminService.releasePayout(testPayout.getId());

                verify(reviewerProfileRepository).processPayout(
                        testReviewerProfile.getId(),
                        testPayout.getAmount()
                );
            }
        }

        @Test
        @DisplayName("should log audit")
        void shouldLogAudit() {
            try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
                mockedSecurityUtils.when(SecurityUtils::getCurrentUser).thenReturn(testAdmin);

                when(payoutRepository.findById(testPayout.getId()))
                        .thenReturn(Optional.of(testPayout));
                when(payoutRepository.save(any(Payout.class))).thenAnswer(i -> i.getArgument(0));

                adminService.releasePayout(testPayout.getId());

                verify(auditService).recordAdminAction(
                        eq(testAdmin),
                        eq("PAYOUT_RELEASE"),
                        eq("PAYOUT"),
                        eq(testPayout.getId()),
                        anyString(),
                        anyMap(),
                        anyMap()
                );
            }
        }
    }
}
