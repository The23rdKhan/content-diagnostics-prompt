package com.contentdiagnostics.reports.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.auth.entity.UserRole;
import com.contentdiagnostics.common.exception.ForbiddenException;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.creators.entity.CreatorProfile;
import com.contentdiagnostics.creators.repository.CreatorProfileRepository;
import com.contentdiagnostics.jobs.entity.Job;
import com.contentdiagnostics.jobs.entity.JobStatus;
import com.contentdiagnostics.reports.dto.ReportComparisonResponse;
import com.contentdiagnostics.reports.dto.ReportResponse;
import com.contentdiagnostics.reports.entity.Report;
import com.contentdiagnostics.reports.repository.ReportRepository;
import com.contentdiagnostics.tasks.entity.Task;
import com.contentdiagnostics.tasks.entity.TaskStatus;
import com.contentdiagnostics.tasks.repository.TaskRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReportService")
class ReportServiceTest {

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private CreatorProfileRepository creatorProfileRepository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private ReportService reportService;

    private User creatorUser;
    private CreatorProfile creatorProfile;
    private Job testJob;
    private Report testReport;

    @BeforeEach
    void setUp() {
        creatorUser = new User();
        creatorUser.setId(UUID.randomUUID());
        creatorUser.setEmail("creator@example.com");
        creatorUser.setRole(UserRole.CREATOR);

        creatorProfile = new CreatorProfile();
        creatorProfile.setId(UUID.randomUUID());
        creatorProfile.setUser(creatorUser);

        testJob = new Job();
        testJob.setId(UUID.randomUUID());
        testJob.setTitle("Test Video");
        testJob.setCreatorProfile(creatorProfile);
        testJob.setStatus(JobStatus.DELIVERED);

        testReport = new Report();
        testReport.setId(UUID.randomUUID());
        testReport.setJob(testJob);
        testReport.setClarityScore(85);
        testReport.setPacingScore(78);
        testReport.setEngagementScore(92);
        testReport.setStructureScore(80);
        testReport.setTotalReviewers(50);
        testReport.setCreatedAt(Instant.now());
    }

    @Nested
    @DisplayName("getReport")
    class GetReport {

        @Test
        @DisplayName("should return report for job owner")
        void shouldReturnReportForOwner() {
            when(reportRepository.findByJobId(testJob.getId())).thenReturn(Optional.of(testReport));
            when(creatorProfileRepository.findByUserId(creatorUser.getId()))
                .thenReturn(Optional.of(creatorProfile));

            ReportResponse response = reportService.getReport(testJob.getId(), creatorUser);

            assertThat(response).isNotNull();
            assertThat(response.getClarityScore()).isEqualTo(85);
            assertThat(response.getPacingScore()).isEqualTo(78);
            assertThat(response.getEngagementScore()).isEqualTo(92);
            assertThat(response.getStructureScore()).isEqualTo(80);
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when report not found")
        void shouldThrowWhenReportNotFound() {
            when(reportRepository.findByJobId(testJob.getId())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> reportService.getReport(testJob.getId(), creatorUser))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Report");
        }

        @Test
        @DisplayName("should throw ForbiddenException when user is not job owner")
        void shouldThrowWhenNotOwner() {
            CreatorProfile differentCreator = new CreatorProfile();
            differentCreator.setId(UUID.randomUUID());

            when(reportRepository.findByJobId(testJob.getId())).thenReturn(Optional.of(testReport));
            when(creatorProfileRepository.findByUserId(creatorUser.getId()))
                .thenReturn(Optional.of(differentCreator));

            assertThatThrownBy(() -> reportService.getReport(testJob.getId(), creatorUser))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("access");
        }

        @Test
        @DisplayName("should allow admin to access any report")
        void shouldAllowAdminAccess() {
            User adminUser = new User();
            adminUser.setId(UUID.randomUUID());
            adminUser.setRole(UserRole.ADMIN);

            when(reportRepository.findByJobId(testJob.getId())).thenReturn(Optional.of(testReport));

            ReportResponse response = reportService.getReport(testJob.getId(), adminUser);

            assertThat(response).isNotNull();
            verify(creatorProfileRepository, never()).findByUserId(any());
        }
    }

    @Nested
    @DisplayName("compileReport - Report Compilation Logic")
    class CompileReport {

        private List<Task> approvedTasks;

        @BeforeEach
        void setUp() {
            approvedTasks = new ArrayList<>();

            // Create 5 approved tasks with varying scores
            for (int i = 0; i < 5; i++) {
                Task task = new Task();
                task.setId(UUID.randomUUID());
                task.setJob(testJob);
                task.setStatus(TaskStatus.APPROVED);
                task.setAnswersJson(createAnswersJson(
                    3 + i % 3, // clarity: 3-5
                    2 + i % 4, // pacing: 2-5
                    4 + i % 2, // engagement: 4-5
                    3 + i % 3  // structure: 3-5
                ));
                approvedTasks.add(task);
            }
        }

        private String createAnswersJson(int clarity, int pacing, int engagement, int structure) {
            return String.format(
                "{\"clarity\": %d, \"pacing\": %d, \"engagement\": %d, \"structure\": %d}",
                clarity, pacing, engagement, structure
            );
        }

        @Test
        @DisplayName("should calculate average scores from approved tasks")
        void shouldCalculateAverageScores() {
            when(taskRepository.findByJobIdAndStatus(testJob.getId(), TaskStatus.APPROVED))
                .thenReturn(approvedTasks);
            when(reportRepository.save(any(Report.class))).thenAnswer(i -> {
                Report r = i.getArgument(0);
                r.setId(UUID.randomUUID());
                return r;
            });

            Report compiled = reportService.compileReport(testJob);

            assertThat(compiled).isNotNull();
            assertThat(compiled.getTotalReviewers()).isEqualTo(5);

            // Verify scores are within expected ranges (0-100)
            assertThat(compiled.getClarityScore()).isBetween(0, 100);
            assertThat(compiled.getPacingScore()).isBetween(0, 100);
            assertThat(compiled.getEngagementScore()).isBetween(0, 100);
            assertThat(compiled.getStructureScore()).isBetween(0, 100);
        }

        @Test
        @DisplayName("should set job reference on report")
        void shouldSetJobReference() {
            when(taskRepository.findByJobIdAndStatus(testJob.getId(), TaskStatus.APPROVED))
                .thenReturn(approvedTasks);
            when(reportRepository.save(any(Report.class))).thenAnswer(i -> i.getArgument(0));

            Report compiled = reportService.compileReport(testJob);

            assertThat(compiled.getJob()).isEqualTo(testJob);
        }

        @Test
        @DisplayName("should handle empty task list gracefully")
        void shouldHandleEmptyTaskList() {
            when(taskRepository.findByJobIdAndStatus(testJob.getId(), TaskStatus.APPROVED))
                .thenReturn(Collections.emptyList());
            when(reportRepository.save(any(Report.class))).thenAnswer(i -> i.getArgument(0));

            Report compiled = reportService.compileReport(testJob);

            assertThat(compiled).isNotNull();
            assertThat(compiled.getTotalReviewers()).isEqualTo(0);
            // Scores should be 0 when no reviewers
            assertThat(compiled.getClarityScore()).isEqualTo(0);
        }

        @Test
        @DisplayName("should aggregate text feedback into highlights")
        void shouldAggregateTextFeedback() {
            for (Task task : approvedTasks) {
                task.setAnswersJson("{\"clarity\": 4, \"pacing\": 4, \"engagement\": 5, \"structure\": 4, " +
                    "\"feedback\": \"Great video content!\"}");
            }

            when(taskRepository.findByJobIdAndStatus(testJob.getId(), TaskStatus.APPROVED))
                .thenReturn(approvedTasks);
            when(reportRepository.save(any(Report.class))).thenAnswer(i -> i.getArgument(0));

            Report compiled = reportService.compileReport(testJob);

            assertThat(compiled.getHighlightsJson()).isNotNull();
        }
    }

    @Nested
    @DisplayName("compareReports")
    class CompareReports {

        private Report report1;
        private Report report2;
        private Job job1;
        private Job job2;

        @BeforeEach
        void setUp() {
            job1 = new Job();
            job1.setId(UUID.randomUUID());
            job1.setTitle("Video 1");
            job1.setCreatorProfile(creatorProfile);

            job2 = new Job();
            job2.setId(UUID.randomUUID());
            job2.setTitle("Video 2");
            job2.setCreatorProfile(creatorProfile);

            report1 = new Report();
            report1.setId(UUID.randomUUID());
            report1.setJob(job1);
            report1.setClarityScore(70);
            report1.setPacingScore(65);
            report1.setEngagementScore(80);
            report1.setStructureScore(75);

            report2 = new Report();
            report2.setId(UUID.randomUUID());
            report2.setJob(job2);
            report2.setClarityScore(85);
            report2.setPacingScore(72);
            report2.setEngagementScore(88);
            report2.setStructureScore(82);
        }

        @Test
        @DisplayName("should calculate score differences between two reports")
        void shouldCalculateScoreDifferences() {
            when(reportRepository.findByJobId(job1.getId())).thenReturn(Optional.of(report1));
            when(reportRepository.findByJobId(job2.getId())).thenReturn(Optional.of(report2));
            when(creatorProfileRepository.findByUserId(creatorUser.getId()))
                .thenReturn(Optional.of(creatorProfile));

            ReportComparisonResponse comparison = reportService.compareReports(
                job1.getId(), job2.getId(), creatorUser);

            assertThat(comparison).isNotNull();
            assertThat(comparison.getClarityDiff()).isEqualTo(15); // 85 - 70
            assertThat(comparison.getPacingDiff()).isEqualTo(7);   // 72 - 65
            assertThat(comparison.getEngagementDiff()).isEqualTo(8); // 88 - 80
            assertThat(comparison.getStructureDiff()).isEqualTo(7);  // 82 - 75
        }

        @Test
        @DisplayName("should include both report summaries")
        void shouldIncludeBothReportSummaries() {
            when(reportRepository.findByJobId(job1.getId())).thenReturn(Optional.of(report1));
            when(reportRepository.findByJobId(job2.getId())).thenReturn(Optional.of(report2));
            when(creatorProfileRepository.findByUserId(creatorUser.getId()))
                .thenReturn(Optional.of(creatorProfile));

            ReportComparisonResponse comparison = reportService.compareReports(
                job1.getId(), job2.getId(), creatorUser);

            assertThat(comparison.getReport1().getClarityScore()).isEqualTo(70);
            assertThat(comparison.getReport2().getClarityScore()).isEqualTo(85);
        }

        @Test
        @DisplayName("should throw when comparing reports from different creators")
        void shouldThrowWhenDifferentCreators() {
            CreatorProfile differentCreator = new CreatorProfile();
            differentCreator.setId(UUID.randomUUID());
            job2.setCreatorProfile(differentCreator);

            when(reportRepository.findByJobId(job1.getId())).thenReturn(Optional.of(report1));
            when(reportRepository.findByJobId(job2.getId())).thenReturn(Optional.of(report2));
            when(creatorProfileRepository.findByUserId(creatorUser.getId()))
                .thenReturn(Optional.of(creatorProfile));

            assertThatThrownBy(() -> reportService.compareReports(job1.getId(), job2.getId(), creatorUser))
                .isInstanceOf(ForbiddenException.class);
        }
    }

    @Nested
    @DisplayName("getReportHistory")
    class GetReportHistory {

        @Test
        @DisplayName("should return paginated report history for creator")
        void shouldReturnPaginatedHistory() {
            List<Report> reports = Arrays.asList(testReport);
            when(creatorProfileRepository.findByUserId(creatorUser.getId()))
                .thenReturn(Optional.of(creatorProfile));
            when(reportRepository.findByCreatorProfileIdOrderByCreatedAtDesc(
                eq(creatorProfile.getId()), any()))
                .thenReturn(reports);

            List<ReportResponse> history = reportService.getReportHistory(creatorUser, 0, 10);

            assertThat(history).hasSize(1);
            assertThat(history.get(0).getClarityScore()).isEqualTo(85);
        }

        @Test
        @DisplayName("should return empty list when no reports exist")
        void shouldReturnEmptyListWhenNoReports() {
            when(creatorProfileRepository.findByUserId(creatorUser.getId()))
                .thenReturn(Optional.of(creatorProfile));
            when(reportRepository.findByCreatorProfileIdOrderByCreatedAtDesc(
                eq(creatorProfile.getId()), any()))
                .thenReturn(Collections.emptyList());

            List<ReportResponse> history = reportService.getReportHistory(creatorUser, 0, 10);

            assertThat(history).isEmpty();
        }
    }
}
