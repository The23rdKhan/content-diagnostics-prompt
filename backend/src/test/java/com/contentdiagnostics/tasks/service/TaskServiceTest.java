package com.contentdiagnostics.tasks.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.auth.entity.UserRole;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.common.exception.ValidationException;
import com.contentdiagnostics.jobs.entity.Job;
import com.contentdiagnostics.jobs.repository.JobRepository;
import com.contentdiagnostics.reviewers.entity.ReviewerProfile;
import com.contentdiagnostics.reviewers.repository.ReviewerProfileRepository;
import com.contentdiagnostics.tasks.dto.TaskSubmissionRequest;
import com.contentdiagnostics.tasks.entity.Task;
import com.contentdiagnostics.tasks.entity.TaskStatus;
import com.contentdiagnostics.tasks.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TaskService")
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private ReviewerProfileRepository reviewerProfileRepository;

    @InjectMocks
    private TaskService taskService;

    private User testReviewer;
    private ReviewerProfile reviewerProfile;
    private Task testTask;
    private Job testJob;

    @BeforeEach
    void setUp() {
        testReviewer = new User();
        testReviewer.setId(UUID.randomUUID());
        testReviewer.setEmail("reviewer@example.com");
        testReviewer.setRole(UserRole.REVIEWER);

        reviewerProfile = new ReviewerProfile();
        reviewerProfile.setId(UUID.randomUUID());
        reviewerProfile.setUser(testReviewer);
        reviewerProfile.setQualityScore(100);
        reviewerProfile.setIsLocked(false);
        reviewerProfile.setTasksCompleted(10);
        reviewerProfile.setTasksApproved(9);
        reviewerProfile.setTasksRejected(1);

        testJob = new Job();
        testJob.setId(UUID.randomUUID());
        testJob.setTitle("Test Video");
        testJob.setLanguage("English");

        testTask = new Task();
        testTask.setId(UUID.randomUUID());
        testTask.setJob(testJob);
        testTask.setStatus(TaskStatus.AVAILABLE);
        testTask.setPayAmount(0.30);
        testTask.setSegmentDurationSeconds(120);
        testTask.setAttentionCheckAnswer("Blue");
    }

    @Nested
    @DisplayName("leaseTask - Atomic Task Leasing")
    class LeaseTask {

        @Test
        @DisplayName("should successfully lease an available task")
        void shouldLeaseAvailableTask() {
            when(reviewerProfileRepository.findByUserId(testReviewer.getId()))
                .thenReturn(Optional.of(reviewerProfile));
            when(taskRepository.leaseTask(eq(testTask.getId()), eq(testReviewer.getId()), any(Instant.class)))
                .thenReturn(1);
            when(taskRepository.findById(testTask.getId()))
                .thenReturn(Optional.of(testTask));

            Task leasedTask = taskService.leaseTask(testTask.getId(), testReviewer);

            assertThat(leasedTask).isNotNull();
            verify(taskRepository).leaseTask(eq(testTask.getId()), eq(testReviewer.getId()), any(Instant.class));
        }

        @Test
        @DisplayName("should throw exception when task already leased by another reviewer")
        void shouldThrowWhenTaskAlreadyLeased() {
            when(reviewerProfileRepository.findByUserId(testReviewer.getId()))
                .thenReturn(Optional.of(reviewerProfile));
            when(taskRepository.leaseTask(eq(testTask.getId()), eq(testReviewer.getId()), any(Instant.class)))
                .thenReturn(0); // No rows updated - task was not available

            assertThatThrownBy(() -> taskService.leaseTask(testTask.getId(), testReviewer))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Task is not available");
        }

        @Test
        @DisplayName("should throw exception when reviewer profile is locked")
        void shouldThrowWhenReviewerLocked() {
            reviewerProfile.setIsLocked(true);
            when(reviewerProfileRepository.findByUserId(testReviewer.getId()))
                .thenReturn(Optional.of(reviewerProfile));

            assertThatThrownBy(() -> taskService.leaseTask(testTask.getId(), testReviewer))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("locked");
        }

        @Test
        @DisplayName("should throw exception when reviewer not found")
        void shouldThrowWhenReviewerNotFound() {
            when(reviewerProfileRepository.findByUserId(testReviewer.getId()))
                .thenReturn(Optional.empty());

            assertThatThrownBy(() -> taskService.leaseTask(testTask.getId(), testReviewer))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Reviewer profile");
        }

        @Test
        @DisplayName("should set lease expiry to 10 minutes from now")
        void shouldSetLeaseExpiryCorrectly() {
            when(reviewerProfileRepository.findByUserId(testReviewer.getId()))
                .thenReturn(Optional.of(reviewerProfile));

            ArgumentCaptor<Instant> expiryCaptor = ArgumentCaptor.forClass(Instant.class);
            when(taskRepository.leaseTask(eq(testTask.getId()), eq(testReviewer.getId()), expiryCaptor.capture()))
                .thenReturn(1);
            when(taskRepository.findById(testTask.getId()))
                .thenReturn(Optional.of(testTask));

            taskService.leaseTask(testTask.getId(), testReviewer);

            Instant capturedExpiry = expiryCaptor.getValue();
            Instant now = Instant.now();
            // Lease should be approximately 10 minutes (600 seconds) from now
            assertThat(capturedExpiry.getEpochSecond() - now.getEpochSecond())
                .isBetween(595L, 605L);
        }
    }

    @Nested
    @DisplayName("submitTask - QC Rules")
    class SubmitTask {

        private TaskSubmissionRequest validSubmission;

        @BeforeEach
        void setUp() {
            testTask.setStatus(TaskStatus.LEASED);
            testTask.setReviewerId(testReviewer.getId());
            testTask.setLeaseExpiresAt(Instant.now().plusSeconds(300)); // 5 min remaining
            testTask.setLeasedAt(Instant.now().minusSeconds(120)); // Leased 2 minutes ago

            validSubmission = new TaskSubmissionRequest();
            validSubmission.setAnswers(Map.of(
                "q1", "Very Clear",
                "q2", "Good pacing",
                "attention_check", "Blue"
            ));
            validSubmission.setWatchedSeconds(100); // 100 out of 120 seconds = 83%
            validSubmission.setCompletionTimeSeconds(120);
        }

        @Test
        @DisplayName("should accept submission with valid watch ratio (>= 70%)")
        void shouldAcceptValidWatchRatio() {
            when(taskRepository.findById(testTask.getId())).thenReturn(Optional.of(testTask));
            when(reviewerProfileRepository.findByUserId(testReviewer.getId()))
                .thenReturn(Optional.of(reviewerProfile));
            when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));

            Task submitted = taskService.submitTask(testTask.getId(), validSubmission, testReviewer);

            assertThat(submitted.getStatus()).isEqualTo(TaskStatus.SUBMITTED);
        }

        @Test
        @DisplayName("should reject submission with watch ratio below 70%")
        void shouldRejectLowWatchRatio() {
            validSubmission.setWatchedSeconds(50); // 50 out of 120 = 41%
            when(taskRepository.findById(testTask.getId())).thenReturn(Optional.of(testTask));
            when(reviewerProfileRepository.findByUserId(testReviewer.getId()))
                .thenReturn(Optional.of(reviewerProfile));

            assertThatThrownBy(() -> taskService.submitTask(testTask.getId(), validSubmission, testReviewer))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("watch ratio");
        }

        @Test
        @DisplayName("should reject submission completed in less than 30 seconds")
        void shouldRejectTooFastCompletion() {
            validSubmission.setCompletionTimeSeconds(20); // Too fast
            when(taskRepository.findById(testTask.getId())).thenReturn(Optional.of(testTask));
            when(reviewerProfileRepository.findByUserId(testReviewer.getId()))
                .thenReturn(Optional.of(reviewerProfile));

            assertThatThrownBy(() -> taskService.submitTask(testTask.getId(), validSubmission, testReviewer))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("completion time");
        }

        @Test
        @DisplayName("should flag incorrect attention check answer")
        void shouldFlagIncorrectAttentionCheck() {
            validSubmission.setAnswers(Map.of(
                "q1", "Very Clear",
                "attention_check", "Red" // Wrong - correct is Blue
            ));
            when(taskRepository.findById(testTask.getId())).thenReturn(Optional.of(testTask));
            when(reviewerProfileRepository.findByUserId(testReviewer.getId()))
                .thenReturn(Optional.of(reviewerProfile));
            when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));

            Task submitted = taskService.submitTask(testTask.getId(), validSubmission, testReviewer);

            assertThat(submitted.getAttentionCheckPassed()).isFalse();
        }

        @Test
        @DisplayName("should pass attention check with correct answer")
        void shouldPassCorrectAttentionCheck() {
            validSubmission.setAnswers(Map.of(
                "q1", "Very Clear",
                "attention_check", "Blue" // Correct
            ));
            when(taskRepository.findById(testTask.getId())).thenReturn(Optional.of(testTask));
            when(reviewerProfileRepository.findByUserId(testReviewer.getId()))
                .thenReturn(Optional.of(reviewerProfile));
            when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));

            Task submitted = taskService.submitTask(testTask.getId(), validSubmission, testReviewer);

            assertThat(submitted.getAttentionCheckPassed()).isTrue();
        }

        @Test
        @DisplayName("should throw exception when submitting task not owned by reviewer")
        void shouldThrowWhenNotOwnedByReviewer() {
            testTask.setReviewerId(UUID.randomUUID()); // Different reviewer
            when(taskRepository.findById(testTask.getId())).thenReturn(Optional.of(testTask));

            assertThatThrownBy(() -> taskService.submitTask(testTask.getId(), validSubmission, testReviewer))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("not assigned");
        }

        @Test
        @DisplayName("should throw exception when submitting expired lease")
        void shouldThrowWhenLeaseExpired() {
            testTask.setLeaseExpiresAt(Instant.now().minusSeconds(60)); // Expired 1 minute ago
            when(taskRepository.findById(testTask.getId())).thenReturn(Optional.of(testTask));
            when(reviewerProfileRepository.findByUserId(testReviewer.getId()))
                .thenReturn(Optional.of(reviewerProfile));

            assertThatThrownBy(() -> taskService.submitTask(testTask.getId(), validSubmission, testReviewer))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("expired");
        }

        @Test
        @DisplayName("should calculate and store watch ratio")
        void shouldCalculateWatchRatio() {
            when(taskRepository.findById(testTask.getId())).thenReturn(Optional.of(testTask));
            when(reviewerProfileRepository.findByUserId(testReviewer.getId()))
                .thenReturn(Optional.of(reviewerProfile));
            when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));

            Task submitted = taskService.submitTask(testTask.getId(), validSubmission, testReviewer);

            // 100 / 120 = 0.833...
            assertThat(submitted.getWatchRatio()).isCloseTo(0.833, org.assertj.core.data.Offset.offset(0.01));
        }
    }

    @Nested
    @DisplayName("processQcResult - Quality Score Updates")
    class ProcessQcResult {

        @BeforeEach
        void setUp() {
            testTask.setStatus(TaskStatus.SUBMITTED);
            testTask.setReviewerId(testReviewer.getId());
        }

        @Test
        @DisplayName("should approve task and increase quality score by 1")
        void shouldApproveAndIncreaseScore() {
            reviewerProfile.setQualityScore(90);
            when(taskRepository.findById(testTask.getId())).thenReturn(Optional.of(testTask));
            when(reviewerProfileRepository.findByUserId(testReviewer.getId()))
                .thenReturn(Optional.of(reviewerProfile));
            when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));
            when(reviewerProfileRepository.save(any(ReviewerProfile.class))).thenAnswer(i -> i.getArgument(0));

            taskService.processQcResult(testTask.getId(), true);

            ArgumentCaptor<ReviewerProfile> profileCaptor = ArgumentCaptor.forClass(ReviewerProfile.class);
            verify(reviewerProfileRepository).save(profileCaptor.capture());

            assertThat(profileCaptor.getValue().getQualityScore()).isEqualTo(91);
            assertThat(profileCaptor.getValue().getTasksApproved()).isEqualTo(10);
        }

        @Test
        @DisplayName("should reject task and decrease quality score by 5")
        void shouldRejectAndDecreaseScore() {
            reviewerProfile.setQualityScore(90);
            when(taskRepository.findById(testTask.getId())).thenReturn(Optional.of(testTask));
            when(reviewerProfileRepository.findByUserId(testReviewer.getId()))
                .thenReturn(Optional.of(reviewerProfile));
            when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));
            when(reviewerProfileRepository.save(any(ReviewerProfile.class))).thenAnswer(i -> i.getArgument(0));

            taskService.processQcResult(testTask.getId(), false);

            ArgumentCaptor<ReviewerProfile> profileCaptor = ArgumentCaptor.forClass(ReviewerProfile.class);
            verify(reviewerProfileRepository).save(profileCaptor.capture());

            assertThat(profileCaptor.getValue().getQualityScore()).isEqualTo(85);
            assertThat(profileCaptor.getValue().getTasksRejected()).isEqualTo(2);
        }

        @Test
        @DisplayName("should lock reviewer when quality score drops below 60")
        void shouldLockReviewerBelowThreshold() {
            reviewerProfile.setQualityScore(62); // Will drop to 57 after rejection
            when(taskRepository.findById(testTask.getId())).thenReturn(Optional.of(testTask));
            when(reviewerProfileRepository.findByUserId(testReviewer.getId()))
                .thenReturn(Optional.of(reviewerProfile));
            when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));
            when(reviewerProfileRepository.save(any(ReviewerProfile.class))).thenAnswer(i -> i.getArgument(0));

            taskService.processQcResult(testTask.getId(), false);

            ArgumentCaptor<ReviewerProfile> profileCaptor = ArgumentCaptor.forClass(ReviewerProfile.class);
            verify(reviewerProfileRepository).save(profileCaptor.capture());

            assertThat(profileCaptor.getValue().getQualityScore()).isEqualTo(57);
            assertThat(profileCaptor.getValue().getIsLocked()).isTrue();
        }

        @Test
        @DisplayName("should cap quality score at 100")
        void shouldCapScoreAt100() {
            reviewerProfile.setQualityScore(100);
            when(taskRepository.findById(testTask.getId())).thenReturn(Optional.of(testTask));
            when(reviewerProfileRepository.findByUserId(testReviewer.getId()))
                .thenReturn(Optional.of(reviewerProfile));
            when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));
            when(reviewerProfileRepository.save(any(ReviewerProfile.class))).thenAnswer(i -> i.getArgument(0));

            taskService.processQcResult(testTask.getId(), true);

            ArgumentCaptor<ReviewerProfile> profileCaptor = ArgumentCaptor.forClass(ReviewerProfile.class);
            verify(reviewerProfileRepository).save(profileCaptor.capture());

            assertThat(profileCaptor.getValue().getQualityScore()).isEqualTo(100);
        }

        @Test
        @DisplayName("should requeue task on rejection")
        void shouldRequeueOnRejection() {
            when(taskRepository.findById(testTask.getId())).thenReturn(Optional.of(testTask));
            when(reviewerProfileRepository.findByUserId(testReviewer.getId()))
                .thenReturn(Optional.of(reviewerProfile));
            when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));
            when(reviewerProfileRepository.save(any(ReviewerProfile.class))).thenAnswer(i -> i.getArgument(0));

            taskService.processQcResult(testTask.getId(), false);

            ArgumentCaptor<Task> taskCaptor = ArgumentCaptor.forClass(Task.class);
            verify(taskRepository).save(taskCaptor.capture());

            assertThat(taskCaptor.getValue().getStatus()).isEqualTo(TaskStatus.REQUEUED);
        }
    }

    @Nested
    @DisplayName("getAvailableTasks")
    class GetAvailableTasks {

        @Test
        @DisplayName("should return tasks matching reviewer language")
        void shouldReturnMatchingLanguageTasks() {
            reviewerProfile.setLanguages(List.of("English", "Spanish"));
            Task englishTask = new Task();
            englishTask.setId(UUID.randomUUID());
            englishTask.setStatus(TaskStatus.AVAILABLE);

            when(reviewerProfileRepository.findByUserId(testReviewer.getId()))
                .thenReturn(Optional.of(reviewerProfile));
            when(taskRepository.findAvailableTasksByLanguages(List.of("English", "Spanish")))
                .thenReturn(List.of(englishTask));

            List<Task> tasks = taskService.getAvailableTasks(testReviewer);

            assertThat(tasks).hasSize(1);
            verify(taskRepository).findAvailableTasksByLanguages(List.of("English", "Spanish"));
        }

        @Test
        @DisplayName("should return empty list for locked reviewer")
        void shouldReturnEmptyForLockedReviewer() {
            reviewerProfile.setIsLocked(true);
            when(reviewerProfileRepository.findByUserId(testReviewer.getId()))
                .thenReturn(Optional.of(reviewerProfile));

            List<Task> tasks = taskService.getAvailableTasks(testReviewer);

            assertThat(tasks).isEmpty();
            verify(taskRepository, never()).findAvailableTasksByLanguages(any());
        }
    }

    @Nested
    @DisplayName("releaseTask")
    class ReleaseTask {

        @Test
        @DisplayName("should release task back to available pool")
        void shouldReleaseTask() {
            testTask.setStatus(TaskStatus.LEASED);
            testTask.setReviewerId(testReviewer.getId());
            when(taskRepository.findById(testTask.getId())).thenReturn(Optional.of(testTask));
            when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));

            taskService.releaseTask(testTask.getId(), testReviewer);

            ArgumentCaptor<Task> taskCaptor = ArgumentCaptor.forClass(Task.class);
            verify(taskRepository).save(taskCaptor.capture());

            Task released = taskCaptor.getValue();
            assertThat(released.getStatus()).isEqualTo(TaskStatus.AVAILABLE);
            assertThat(released.getReviewerId()).isNull();
            assertThat(released.getLeaseExpiresAt()).isNull();
        }

        @Test
        @DisplayName("should throw exception when releasing task not owned")
        void shouldThrowWhenNotOwned() {
            testTask.setStatus(TaskStatus.LEASED);
            testTask.setReviewerId(UUID.randomUUID()); // Different reviewer
            when(taskRepository.findById(testTask.getId())).thenReturn(Optional.of(testTask));

            assertThatThrownBy(() -> taskService.releaseTask(testTask.getId(), testReviewer))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("not assigned");
        }
    }
}
