package com.contentdiagnostics.integration;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.auth.entity.UserRole;
import com.contentdiagnostics.auth.repository.UserRepository;
import com.contentdiagnostics.jobs.entity.Job;
import com.contentdiagnostics.jobs.entity.JobStatus;
import com.contentdiagnostics.jobs.repository.JobRepository;
import com.contentdiagnostics.reports.dto.ReportComparisonResponse;
import com.contentdiagnostics.reports.dto.ReportDto;
import com.contentdiagnostics.reports.entity.Report;
import com.contentdiagnostics.reports.entity.ReportStatus;
import com.contentdiagnostics.reports.repository.ReportRepository;
import com.contentdiagnostics.reports.service.ReportService;
import com.contentdiagnostics.tasks.entity.Task;
import com.contentdiagnostics.tasks.entity.TaskStatus;
import com.contentdiagnostics.tasks.repository.TaskRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for report compilation and retrieval.
 *
 * Tests the happy path of:
 * 1. Report creation from completed job
 * 2. Report retrieval by creator
 * 3. Report comparison between two reports
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ReportCompilationTest extends BaseIntegrationTest {

    @Autowired
    private ReportService reportService;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private User testCreator;
    private Job testJob;
    private Report testReport;

    @BeforeEach
    @Transactional
    void setUp() throws Exception {
        // Create test creator
        testCreator = User.builder()
                .email("creator-" + System.currentTimeMillis() + "@test.com")
                .passwordHash(passwordEncoder.encode("password"))
                .role(UserRole.CREATOR)
                .enabled(true)
                .build();
        testCreator = userRepository.save(testCreator);

        // Create test job (delivered)
        testJob = Job.builder()
                .creator(testCreator)
                .title("Test Video")
                .language("English")
                .status(JobStatus.DELIVERED)
                .slaHours(48)
                .guaranteedReviewers(50)
                .completedReviewers(52)
                .deliveredAt(Instant.now())
                .deliveryTimeHours(36)
                .build();
        testJob = jobRepository.save(testJob);

        // Create approved tasks for the job
        for (int i = 0; i < 5; i++) {
            Task task = Task.builder()
                    .job(testJob)
                    .segmentIndex(i)
                    .segmentStart(i * 60)
                    .segmentEnd((i + 1) * 60)
                    .payAmount(0.30)
                    .status(TaskStatus.APPROVED)
                    .language("English")
                    .answersJson("{\"q1\": \"Very Clear\", \"q2\": \"Just Right\"}")
                    .submittedAt(Instant.now().minusSeconds(3600))
                    .reviewedAt(Instant.now().minusSeconds(1800))
                    .attentionCheckPassed(true)
                    .build();
            taskRepository.save(task);
        }

        // Create test report
        String timelineInsightsJson = objectMapper.writeValueAsString(List.of(
                new TimelineInsightData("0:00-1:00", "Introduction well-received", "high"),
                new TimelineInsightData("1:00-2:00", "Technical section needs clarity", "medium"),
                new TimelineInsightData("2:00-3:00", "Conclusion is strong", "high")
        ));

        String humanReviewsJson = objectMapper.writeValueAsString(
                new HumanReviewsData(52, 96, List.of("Clear explanation", "Good pacing"))
        );

        testReport = Report.builder()
                .creator(testCreator)
                .job(testJob)
                .status(ReportStatus.DELIVERED)
                .videoTitle("Test Video")
                .duration("5:00")
                .videoDurationMinutes(5)
                .languagePool("English")
                .guaranteedReviewers(50)
                .slaWindow("48h")
                .actualDeliveryTime("36h")
                .clarityScore(85)
                .pacingScore(78)
                .engagementScore(82)
                .structureScore(80)
                .executiveSummary("Overall positive feedback with minor suggestions for clarity in technical sections.")
                .timelineInsightsJson(timelineInsightsJson)
                .humanReviewsJson(humanReviewsJson)
                .dateSubmitted(Instant.now().minusSeconds(86400 * 2))
                .dateCompleted(Instant.now())
                .build();
        testReport = reportRepository.save(testReport);
    }

    @Test
    @Order(1)
    @DisplayName("Should retrieve creator reports")
    void shouldRetrieveCreatorReports() {
        List<ReportDto> reports = reportService.getCreatorReports(testCreator);

        assertThat(reports).isNotEmpty();
        assertThat(reports.get(0).getVideoTitle()).isEqualTo("Test Video");
        assertThat(reports.get(0).getClarityScore()).isEqualTo(85);
        assertThat(reports.get(0).getStatus()).isEqualTo(ReportStatus.DELIVERED);
    }

    @Test
    @Order(2)
    @DisplayName("Should retrieve single report by ID")
    void shouldRetrieveSingleReport() {
        ReportDto report = reportService.getReport(testCreator, testReport.getId());

        assertThat(report).isNotNull();
        assertThat(report.getId()).isEqualTo(testReport.getId());
        assertThat(report.getVideoTitle()).isEqualTo("Test Video");
        assertThat(report.getClarityScore()).isEqualTo(85);
        assertThat(report.getPacingScore()).isEqualTo(78);
        assertThat(report.getEngagementScore()).isEqualTo(82);
        assertThat(report.getStructureScore()).isEqualTo(80);
        assertThat(report.getExecutiveSummary()).contains("positive feedback");
    }

    @Test
    @Order(3)
    @DisplayName("Should compare two reports")
    @Transactional
    void shouldCompareTwoReports() throws Exception {
        // Create a second job and report for comparison
        Job secondJob = Job.builder()
                .creator(testCreator)
                .title("Second Test Video")
                .language("English")
                .status(JobStatus.DELIVERED)
                .slaHours(48)
                .guaranteedReviewers(50)
                .completedReviewers(55)
                .deliveredAt(Instant.now())
                .deliveryTimeHours(40)
                .build();
        secondJob = jobRepository.save(secondJob);

        Report secondReport = Report.builder()
                .creator(testCreator)
                .job(secondJob)
                .status(ReportStatus.DELIVERED)
                .videoTitle("Second Test Video")
                .duration("6:30")
                .videoDurationMinutes(7)
                .languagePool("English")
                .guaranteedReviewers(50)
                .slaWindow("48h")
                .actualDeliveryTime("40h")
                .clarityScore(90)  // +5 from first report
                .pacingScore(75)  // -3 from first report
                .engagementScore(88)  // +6 from first report
                .structureScore(85)  // +5 from first report
                .executiveSummary("Improved clarity and structure compared to previous video.")
                .dateSubmitted(Instant.now().minusSeconds(86400))
                .dateCompleted(Instant.now())
                .build();
        secondReport = reportRepository.save(secondReport);

        // Compare reports
        ReportComparisonResponse comparison = reportService.compareReports(
                testCreator,
                testReport.getId(),
                secondReport.getId()
        );

        assertThat(comparison).isNotNull();
        assertThat(comparison.getLeftReport().getId()).isEqualTo(testReport.getId());
        assertThat(comparison.getRightReport().getId()).isEqualTo(secondReport.getId());

        // Check score deltas
        assertThat(comparison.getScoreComparison().getClarityDelta()).isEqualTo(5);  // 90 - 85
        assertThat(comparison.getScoreComparison().getPacingDelta()).isEqualTo(-3); // 75 - 78
        assertThat(comparison.getScoreComparison().getEngagementDelta()).isEqualTo(6); // 88 - 82
        assertThat(comparison.getScoreComparison().getStructureDelta()).isEqualTo(5); // 85 - 80

        // Overall trend should be "improved" (3 positive, 1 negative)
        assertThat(comparison.getScoreComparison().getOverallTrend()).isEqualTo("improved");
    }

    @Test
    @Order(4)
    @DisplayName("Should parse timeline insights correctly")
    void shouldParseTimelineInsights() {
        ReportDto report = reportService.getReport(testCreator, testReport.getId());

        assertThat(report.getTimelineInsights()).isNotNull();
        assertThat(report.getTimelineInsights()).hasSize(3);
        assertThat(report.getTimelineInsights().get(0).getTimestamp()).isEqualTo("0:00-1:00");
        assertThat(report.getTimelineInsights().get(0).getInsight()).contains("well-received");
    }

    @Test
    @Order(5)
    @DisplayName("Should not return reports for different creator")
    @Transactional
    void shouldNotReturnReportsForDifferentCreator() {
        // Create different creator
        User differentCreator = User.builder()
                .email("different-" + System.currentTimeMillis() + "@test.com")
                .passwordHash(passwordEncoder.encode("password"))
                .role(UserRole.CREATOR)
                .enabled(true)
                .build();
        differentCreator = userRepository.save(differentCreator);

        List<ReportDto> reports = reportService.getCreatorReports(differentCreator);

        assertThat(reports).isEmpty();
    }

    @Test
    @Order(6)
    @DisplayName("Should track compilation status in report")
    void shouldTrackCompilationStatus() {
        ReportDto report = reportService.getReport(testCreator, testReport.getId());

        // Report is DELIVERED so all should be complete
        assertThat(report.isCompiled()).isTrue();
        assertThat(report.isAiComplete()).isTrue();
        assertThat(report.isHumanComplete()).isTrue();
    }

    @Test
    @Order(7)
    @DisplayName("Should handle report in COMPILING status")
    @Transactional
    void shouldHandleReportInCompilingStatus() throws Exception {
        // Create a job that's in COMPILING status
        Job compilingJob = Job.builder()
                .creator(testCreator)
                .title("Compiling Video")
                .language("English")
                .status(JobStatus.COMPILING)
                .slaHours(48)
                .guaranteedReviewers(50)
                .completedReviewers(50)
                .build();
        compilingJob = jobRepository.save(compilingJob);

        Report compilingReport = Report.builder()
                .creator(testCreator)
                .job(compilingJob)
                .status(ReportStatus.COMPILING)
                .videoTitle("Compiling Video")
                .duration("4:00")
                .videoDurationMinutes(4)
                .languagePool("English")
                .guaranteedReviewers(50)
                .slaWindow("48h")
                .dateSubmitted(Instant.now().minusSeconds(3600))
                .build();
        compilingReport = reportRepository.save(compilingReport);

        ReportDto report = reportService.getReport(testCreator, compilingReport.getId());

        // Report is COMPILING so compiled should be false
        assertThat(report.isCompiled()).isFalse();
        assertThat(report.isAiComplete()).isFalse();  // Based on status != COMPILING check
        assertThat(report.isHumanComplete()).isTrue();  // COMPILING means human review is done
    }

    // Helper DTOs for JSON serialization
    record TimelineInsightData(String timestamp, String insight, String importance) {}
    record HumanReviewsData(int totalReviewers, int agreementRate, List<String> topComments) {}
}
