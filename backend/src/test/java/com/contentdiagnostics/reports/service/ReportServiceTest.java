package com.contentdiagnostics.reports.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.auth.entity.UserRole;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.jobs.entity.Job;
import com.contentdiagnostics.reports.dto.ReportComparisonResponse;
import com.contentdiagnostics.reports.dto.ReportDto;
import com.contentdiagnostics.reports.entity.Report;
import com.contentdiagnostics.reports.entity.ReportStatus;
import com.contentdiagnostics.reports.repository.ReportRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReportService")
class ReportServiceTest {

    @Mock
    private ReportRepository reportRepository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private ReportService reportService;

    private User creatorUser;
    private Job testJob;
    private Report testReport;

    @BeforeEach
    void setUp() {
        creatorUser = new User();
        creatorUser.setId(1L);
        creatorUser.setEmail("creator@example.com");
        creatorUser.setRole(UserRole.CREATOR);

        testJob = new Job();
        testJob.setId(1L);
        testJob.setCreator(creatorUser);

        testReport = Report.builder()
                .id(1L)
                .job(testJob)
                .creator(creatorUser)
                .videoTitle("Test Video")
                .status(ReportStatus.DELIVERED)
                .clarityScore(85)
                .pacingScore(78)
                .engagementScore(92)
                .structureScore(80)
                .guaranteedReviewers(10)
                .slaWindow("48h")
                .createdAt(Instant.now())
                .build();
    }

    @Nested
    @DisplayName("getCreatorReports")
    class GetCreatorReports {

        @Test
        @DisplayName("should return reports for creator")
        void shouldReturnReportsForCreator() {
            when(reportRepository.findByCreatorOrderByCreatedAtDesc(creatorUser))
                    .thenReturn(List.of(testReport));

            List<ReportDto> reports = reportService.getCreatorReports(creatorUser);

            assertThat(reports).hasSize(1);
            assertThat(reports.get(0).getClarityScore()).isEqualTo(85);
            assertThat(reports.get(0).getVideoTitle()).isEqualTo("Test Video");
        }

        @Test
        @DisplayName("should return empty list when no reports")
        void shouldReturnEmptyListWhenNoReports() {
            when(reportRepository.findByCreatorOrderByCreatedAtDesc(creatorUser))
                    .thenReturn(Collections.emptyList());

            List<ReportDto> reports = reportService.getCreatorReports(creatorUser);

            assertThat(reports).isEmpty();
        }
    }

    @Nested
    @DisplayName("getReport")
    class GetReport {

        @Test
        @DisplayName("should return report for owner")
        void shouldReturnReportForOwner() {
            when(reportRepository.findByIdAndCreator(testReport.getId(), creatorUser))
                    .thenReturn(Optional.of(testReport));

            ReportDto result = reportService.getReport(creatorUser, testReport.getId());

            assertThat(result).isNotNull();
            assertThat(result.getClarityScore()).isEqualTo(85);
            assertThat(result.getPacingScore()).isEqualTo(78);
            assertThat(result.getEngagementScore()).isEqualTo(92);
            assertThat(result.getStructureScore()).isEqualTo(80);
        }

        @Test
        @DisplayName("should throw when report not found")
        void shouldThrowWhenNotFound() {
            when(reportRepository.findByIdAndCreator(99L, creatorUser))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> reportService.getReport(creatorUser, 99L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Report");
        }

        @Test
        @DisplayName("should map all fields correctly")
        void shouldMapAllFieldsCorrectly() {
            testReport.setExecutiveSummary("Great video overall");
            when(reportRepository.findByIdAndCreator(testReport.getId(), creatorUser))
                    .thenReturn(Optional.of(testReport));

            ReportDto result = reportService.getReport(creatorUser, testReport.getId());

            assertThat(result.getExecutiveSummary()).isEqualTo("Great video overall");
            assertThat(result.getStatus()).isEqualTo(ReportStatus.DELIVERED);
            assertThat(result.getGuaranteedReviewers()).isEqualTo(10);
        }
    }

    @Nested
    @DisplayName("compareReports")
    class CompareReports {

        private Report report1;
        private Report report2;

        @BeforeEach
        void setUp() {
            report1 = Report.builder()
                    .id(1L)
                    .creator(creatorUser)
                    .videoTitle("Video 1")
                    .status(ReportStatus.DELIVERED)
                    .clarityScore(70)
                    .pacingScore(65)
                    .engagementScore(80)
                    .structureScore(75)
                    .build();

            report2 = Report.builder()
                    .id(2L)
                    .creator(creatorUser)
                    .videoTitle("Video 2")
                    .status(ReportStatus.DELIVERED)
                    .clarityScore(85)
                    .pacingScore(72)
                    .engagementScore(88)
                    .structureScore(82)
                    .build();
        }

        @Test
        @DisplayName("should calculate score differences")
        void shouldCalculateScoreDifferences() {
            when(reportRepository.findByIdAndCreator(1L, creatorUser))
                    .thenReturn(Optional.of(report1));
            when(reportRepository.findByIdAndCreator(2L, creatorUser))
                    .thenReturn(Optional.of(report2));

            ReportComparisonResponse comparison = reportService.compareReports(creatorUser, 1L, 2L);

            assertThat(comparison).isNotNull();
            assertThat(comparison.getScoreComparison().getClarityDelta()).isEqualTo(15);
            assertThat(comparison.getScoreComparison().getPacingDelta()).isEqualTo(7);
            assertThat(comparison.getScoreComparison().getEngagementDelta()).isEqualTo(8);
            assertThat(comparison.getScoreComparison().getStructureDelta()).isEqualTo(7);
        }

        @Test
        @DisplayName("should determine overall trend as improved")
        void shouldDetermineImprovedTrend() {
            when(reportRepository.findByIdAndCreator(1L, creatorUser))
                    .thenReturn(Optional.of(report1));
            when(reportRepository.findByIdAndCreator(2L, creatorUser))
                    .thenReturn(Optional.of(report2));

            ReportComparisonResponse comparison = reportService.compareReports(creatorUser, 1L, 2L);

            assertThat(comparison.getScoreComparison().getOverallTrend()).isEqualTo("improved");
        }

        @Test
        @DisplayName("should include both report summaries")
        void shouldIncludeBothReportSummaries() {
            when(reportRepository.findByIdAndCreator(1L, creatorUser))
                    .thenReturn(Optional.of(report1));
            when(reportRepository.findByIdAndCreator(2L, creatorUser))
                    .thenReturn(Optional.of(report2));

            ReportComparisonResponse comparison = reportService.compareReports(creatorUser, 1L, 2L);

            assertThat(comparison.getLeftReport().getClarityScore()).isEqualTo(70);
            assertThat(comparison.getRightReport().getClarityScore()).isEqualTo(85);
        }

        @Test
        @DisplayName("should throw when left report not found")
        void shouldThrowWhenLeftReportNotFound() {
            when(reportRepository.findByIdAndCreator(1L, creatorUser))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> reportService.compareReports(creatorUser, 1L, 2L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("should throw when right report not found")
        void shouldThrowWhenRightReportNotFound() {
            when(reportRepository.findByIdAndCreator(1L, creatorUser))
                    .thenReturn(Optional.of(report1));
            when(reportRepository.findByIdAndCreator(2L, creatorUser))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> reportService.compareReports(creatorUser, 1L, 2L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("should handle null scores gracefully")
        void shouldHandleNullScoresGracefully() {
            report1.setClarityScore(null);
            report2.setClarityScore(null);

            when(reportRepository.findByIdAndCreator(1L, creatorUser))
                    .thenReturn(Optional.of(report1));
            when(reportRepository.findByIdAndCreator(2L, creatorUser))
                    .thenReturn(Optional.of(report2));

            ReportComparisonResponse comparison = reportService.compareReports(creatorUser, 1L, 2L);

            assertThat(comparison.getScoreComparison().getClarityDelta()).isNull();
        }
    }
}
