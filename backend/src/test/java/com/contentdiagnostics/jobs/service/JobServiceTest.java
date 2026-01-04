package com.contentdiagnostics.jobs.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.auth.entity.UserRole;
import com.contentdiagnostics.common.exception.BadRequestException;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.credits.service.CreditService;
import com.contentdiagnostics.jobs.dto.JobDto;
import com.contentdiagnostics.jobs.dto.SubmitVideoRequest;
import com.contentdiagnostics.jobs.entity.Job;
import com.contentdiagnostics.jobs.entity.JobStatus;
import com.contentdiagnostics.jobs.repository.JobRepository;
import com.contentdiagnostics.reports.repository.ReportRepository;
import com.contentdiagnostics.tasks.service.TaskCreationService;
import com.contentdiagnostics.videos.entity.Video;
import com.contentdiagnostics.videos.entity.VideoStatus;
import com.contentdiagnostics.videos.repository.VideoRepository;
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
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("JobService")
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private VideoRepository videoRepository;

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private TaskCreationService taskCreationService;

    @Mock
    private CreditService creditService;

    @InjectMocks
    private JobService jobService;

    private User testCreator;
    private Video testVideo;
    private Job testJob;

    @BeforeEach
    void setUp() {
        testCreator = new User();
        testCreator.setId(1L);
        testCreator.setEmail("creator@example.com");
        testCreator.setRole(UserRole.CREATOR);

        testVideo = new Video();
        testVideo.setId(100L);
        testVideo.setTitle("Test Video");
        testVideo.setFileName("test.mp4");
        testVideo.setFileSize(1024L);
        testVideo.setLanguage("English");
        testVideo.setStatus(VideoStatus.UPLOADED);
        testVideo.setCreator(testCreator);

        testJob = Job.builder()
                .id(1L)
                .creator(testCreator)
                .video(testVideo)
                .status(JobStatus.SEGMENTED)
                .language("English")
                .slaHours(48)
                .requiredReviewers(10)
                .completedReviewers(0)
                .fasterDelivery(false)
                .fullWatchSummary(false)
                .liveFeedback(false)
                .aiDiagnosticsComplete(false)
                .humanReviewComplete(false)
                .reportCompiled(false)
                .createdAt(Instant.now())
                .build();
    }

    @Nested
    @DisplayName("getCreatorJobs")
    class GetCreatorJobs {

        @Test
        @DisplayName("should return jobs ordered by creation date")
        void shouldReturnJobsOrderedByCreationDate() {
            when(jobRepository.findByCreatorOrderByCreatedAtDesc(testCreator))
                    .thenReturn(List.of(testJob));

            List<JobDto> jobs = jobService.getCreatorJobs(testCreator);

            assertThat(jobs).hasSize(1);
            assertThat(jobs.get(0).getId()).isEqualTo(testJob.getId());
            verify(jobRepository).findByCreatorOrderByCreatedAtDesc(testCreator);
        }

        @Test
        @DisplayName("should return empty list for new creator")
        void shouldReturnEmptyListForNewCreator() {
            when(jobRepository.findByCreatorOrderByCreatedAtDesc(testCreator))
                    .thenReturn(Collections.emptyList());

            List<JobDto> jobs = jobService.getCreatorJobs(testCreator);

            assertThat(jobs).isEmpty();
        }
    }

    @Nested
    @DisplayName("submitVideoForReview")
    class SubmitVideoForReview {

        private SubmitVideoRequest validRequest;

        @BeforeEach
        void setUp() {
            validRequest = new SubmitVideoRequest();
            validRequest.setRequiredReviewers(10);
        }

        @Test
        @DisplayName("should create job and deduct credits")
        void shouldCreateJobAndDeductCredits() {
            when(videoRepository.findByIdAndCreator(testVideo.getId(), testCreator))
                    .thenReturn(Optional.of(testVideo));
            when(jobRepository.save(any(Job.class))).thenAnswer(i -> {
                Job j = i.getArgument(0);
                j.setId(1L);
                j.setCreatedAt(Instant.now());
                return j;
            });

            JobDto result = jobService.submitVideoForReview(testCreator, testVideo.getId(), validRequest);

            assertThat(result).isNotNull();
            verify(creditService).deductCreditsForVideo(eq(testCreator), any(), eq(5));
            verify(taskCreationService).createTasksForJob(any(Job.class), eq(testVideo));
        }

        @Test
        @DisplayName("should throw when video not found")
        void shouldThrowWhenVideoNotFound() {
            when(videoRepository.findByIdAndCreator(testVideo.getId(), testCreator))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> jobService.submitVideoForReview(testCreator, testVideo.getId(), validRequest))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Video");
        }

        @Test
        @DisplayName("should throw when video not ready")
        void shouldThrowWhenVideoNotReady() {
            testVideo.setStatus(VideoStatus.PROCESSING);
            when(videoRepository.findByIdAndCreator(testVideo.getId(), testCreator))
                    .thenReturn(Optional.of(testVideo));

            assertThatThrownBy(() -> jobService.submitVideoForReview(testCreator, testVideo.getId(), validRequest))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("not ready");
        }

        @Test
        @DisplayName("should delete job if credit deduction fails")
        void shouldDeleteJobIfCreditDeductionFails() {
            when(videoRepository.findByIdAndCreator(testVideo.getId(), testCreator))
                    .thenReturn(Optional.of(testVideo));
            when(jobRepository.save(any(Job.class))).thenAnswer(i -> {
                Job j = i.getArgument(0);
                j.setId(1L);
                j.setCreatedAt(Instant.now());
                return j;
            });
            doThrow(new BadRequestException("Insufficient credits"))
                    .when(creditService).deductCreditsForVideo(any(), any(), anyInt());

            assertThatThrownBy(() -> jobService.submitVideoForReview(testCreator, testVideo.getId(), validRequest))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Insufficient");

            verify(jobRepository).delete(any(Job.class));
        }

        @Test
        @DisplayName("should set 24h SLA when fasterDelivery is true")
        void shouldSet24hSlaForFasterDelivery() {
            validRequest.setFasterDelivery(true);
            when(videoRepository.findByIdAndCreator(testVideo.getId(), testCreator))
                    .thenReturn(Optional.of(testVideo));
            when(jobRepository.save(any(Job.class))).thenAnswer(i -> {
                Job j = i.getArgument(0);
                j.setId(1L);
                j.setCreatedAt(Instant.now());
                return j;
            });

            jobService.submitVideoForReview(testCreator, testVideo.getId(), validRequest);

            ArgumentCaptor<Job> jobCaptor = ArgumentCaptor.forClass(Job.class);
            verify(jobRepository, times(2)).save(jobCaptor.capture());
            assertThat(jobCaptor.getAllValues().get(0).getSlaHours()).isEqualTo(24);
        }
    }

    @Nested
    @DisplayName("getJob")
    class GetJob {

        @Test
        @DisplayName("should return job for owner")
        void shouldReturnJobForOwner() {
            when(jobRepository.findByIdAndCreator(testJob.getId(), testCreator))
                    .thenReturn(Optional.of(testJob));

            JobDto result = jobService.getJob(testCreator, testJob.getId());

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(testJob.getId());
        }

        @Test
        @DisplayName("should throw when job not found")
        void shouldThrowWhenJobNotFound() {
            when(jobRepository.findByIdAndCreator(testJob.getId(), testCreator))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> jobService.getJob(testCreator, testJob.getId()))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Job");
        }
    }

    @Nested
    @DisplayName("cancelJob")
    class CancelJob {

        @Test
        @DisplayName("should cancel and refund credits")
        void shouldCancelAndRefundCredits() {
            testJob.setStatus(JobStatus.IN_REVIEW);
            when(jobRepository.findById(testJob.getId())).thenReturn(Optional.of(testJob));

            JobDto result = jobService.cancelJob(testCreator, testJob.getId());

            assertThat(result.getStatus()).isEqualTo(JobStatus.CANCELLED);
            verify(jobRepository).updateStatus(testJob.getId(), JobStatus.CANCELLED);
            verify(creditService).refundCredits(testCreator, testJob.getId(), 5, "Job cancelled by user");
        }

        @Test
        @DisplayName("should throw when job not found")
        void shouldThrowWhenJobNotFound() {
            when(jobRepository.findById(testJob.getId())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> jobService.cancelJob(testCreator, testJob.getId()))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Job");
        }

        @Test
        @DisplayName("should throw when not owner")
        void shouldThrowWhenNotOwner() {
            User differentUser = new User();
            differentUser.setId(999L);
            when(jobRepository.findById(testJob.getId())).thenReturn(Optional.of(testJob));

            assertThatThrownBy(() -> jobService.cancelJob(differentUser, testJob.getId()))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Not authorized");
        }

        @Test
        @DisplayName("should throw when job not cancellable (DELIVERED status)")
        void shouldThrowWhenJobNotCancellable() {
            testJob.setStatus(JobStatus.DELIVERED);
            when(jobRepository.findById(testJob.getId())).thenReturn(Optional.of(testJob));

            assertThatThrownBy(() -> jobService.cancelJob(testCreator, testJob.getId()))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("cannot be cancelled");
        }

        @Test
        @DisplayName("should allow cancellation for IN_REVIEW status")
        void shouldAllowCancellationForInReviewStatus() {
            testJob.setStatus(JobStatus.IN_REVIEW);
            when(jobRepository.findById(testJob.getId())).thenReturn(Optional.of(testJob));

            JobDto result = jobService.cancelJob(testCreator, testJob.getId());

            assertThat(result.getStatus()).isEqualTo(JobStatus.CANCELLED);
        }
    }
}
