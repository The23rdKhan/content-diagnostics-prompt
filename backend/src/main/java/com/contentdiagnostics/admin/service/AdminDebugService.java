package com.contentdiagnostics.admin.service;

import com.contentdiagnostics.admin.dto.AdminDebugCompileResponse;
import com.contentdiagnostics.admin.dto.AdminDebugRequeueResponse;
import com.contentdiagnostics.admin.dto.AdminDebugSampleResponse;
import com.contentdiagnostics.audit.service.AuditService;
import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.auth.entity.UserRole;
import com.contentdiagnostics.auth.repository.UserRepository;
import com.contentdiagnostics.common.exception.ForbiddenException;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.common.util.SecurityUtils;
import com.contentdiagnostics.creators.entity.CreatorProfile;
import com.contentdiagnostics.creators.repository.CreatorProfileRepository;
import com.contentdiagnostics.jobs.entity.Job;
import com.contentdiagnostics.jobs.entity.JobStatus;
import com.contentdiagnostics.jobs.repository.JobRepository;
import com.contentdiagnostics.reports.entity.Report;
import com.contentdiagnostics.reports.entity.ReportStatus;
import com.contentdiagnostics.reports.repository.ReportRepository;
import com.contentdiagnostics.reviewers.entity.ReviewerProfile;
import com.contentdiagnostics.reviewers.repository.ReviewerProfileRepository;
import com.contentdiagnostics.tasks.dto.TaskDto;
import com.contentdiagnostics.tasks.entity.Task;
import com.contentdiagnostics.tasks.entity.TaskStatus;
import com.contentdiagnostics.tasks.repository.TaskRepository;
import com.contentdiagnostics.videos.entity.Video;
import com.contentdiagnostics.videos.entity.VideoStatus;
import com.contentdiagnostics.videos.repository.VideoRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Staging-only admin debug tools for seeding sample data.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminDebugService {

    private static final String CREATOR_EMAIL = "creator+debug@contentdiagnostics.com";
    private static final String REVIEWER_EMAIL = "reviewer+debug@contentdiagnostics.com";
    private static final String DEBUG_PASSWORD = "ChangeMe123!";

    private final UserRepository userRepository;
    private final CreatorProfileRepository creatorProfileRepository;
    private final ReviewerProfileRepository reviewerProfileRepository;
    private final VideoRepository videoRepository;
    private final JobRepository jobRepository;
    private final TaskRepository taskRepository;
    private final ReportRepository reportRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;
    private final AuditService auditService;

    @Value("${app.debug-tools.enabled:false}")
    private boolean debugEnabled;

    @Transactional
    public AdminDebugSampleResponse createSampleJobAndTasks() {
        ensureEnabled();

        User admin = SecurityUtils.getCurrentUser();
        User creator = getOrCreateCreator();
        ReviewerProfile reviewer = getOrCreateReviewer();

        Video video = Video.builder()
                .creator(creator)
                .title("Sample Launch Video")
                .fileName("sample-launch.mp4")
                .fileSize(125_000_000L)
                .storageKey("debug/sample-launch.mp4")
                .storageUrl("https://example.com/debug/sample-launch.mp4")
                .status(VideoStatus.READY)
                .language("English")
                .durationSeconds(300)
                .build();
        video = videoRepository.save(video);

        Job job = Job.builder()
                .creator(creator)
                .video(video)
                .status(JobStatus.IN_REVIEW)
                .language("English")
                .slaHours(48)
                .requiredReviewers(3)
                .completedReviewers(0)
                .aiDiagnosticsComplete(true)
                .humanReviewComplete(false)
                .reportCompiled(false)
                .slaDeadline(Instant.now().plus(48, ChronoUnit.HOURS))
                .build();
        job = jobRepository.save(job);

        String questionsJson = buildSampleQuestionsJson();

        List<Task> tasks = List.of(
                buildTask(job, questionsJson, "0:00-1:40", 0, 100, reviewer.getLanguage()),
                buildTask(job, questionsJson, "1:40-3:20", 100, 200, reviewer.getLanguage()),
                buildTask(job, questionsJson, "3:20-5:00", 200, 300, reviewer.getLanguage())
        );

        tasks = taskRepository.saveAll(tasks);

        Report report = Report.builder()
                .creator(creator)
                .job(job)
                .status(ReportStatus.COMPILING)
                .videoTitle(video.getTitle())
                .duration("5:00")
                .videoDurationMinutes(5)
                .languagePool("English")
                .guaranteedReviewers(job.getTotalRequiredReviewers())
                .slaWindow("48h")
                .dateSubmitted(Instant.now())
                .seriesId(UUID.randomUUID().toString())
                .version(1)
                .build();
        report = reportRepository.save(report);

        Map<String, Object> newValues = Map.of(
                "jobId", job.getId(),
                "reportId", report.getId(),
                "tasks", tasks.stream().map(Task::getId).toList(),
                "creatorEmail", creator.getEmail()
        );

        auditService.recordAdminAction(
                admin,
                "DEBUG_SAMPLE_DATA_CREATED",
                "JOB",
                job.getId(),
                "Created sample job and tasks",
                Map.of(),
                newValues
        );

        log.info("Admin {} created debug sample job {}", admin.getId(), job.getId());

        return AdminDebugSampleResponse.builder()
                .jobId(job.getId())
                .reportId(report.getId())
                .taskIds(tasks.stream().map(Task::getId).collect(Collectors.toList()))
                .creatorEmail(creator.getEmail())
                .reviewerEmail(reviewer.getUser().getEmail())
                .build();
    }

    @Transactional
    public AdminDebugCompileResponse triggerReportCompilation(Long jobId) {
        ensureEnabled();

        Job job = resolveJob(jobId);
        Report report = reportRepository.findByJob(job).orElseGet(() -> createStubReport(job));

        String timelineJson = "[{\"timestamp\":\"0:45\",\"observation\":\"Hook could be stronger.\"}]";
        String aiAnalysisJson = "{\"summary\":\"Solid pacing with minor dips.\"}";
        String humanReviewsJson = "{\"highlights\":[\"Clear value prop\"],\"concerns\":[\"CTA is late\"]}";
        String actionPlanJson = "[{\"title\":\"Strengthen opening\",\"priority\":\"high\",\"description\":\"Move CTA earlier.\"}]";

        report.setStatus(ReportStatus.DELIVERED);
        report.setClarityScore(78);
        report.setPacingScore(82);
        report.setEngagementScore(75);
        report.setStructureScore(80);
        report.setExecutiveSummary("Strong narrative, but tighten the opening and add a clearer CTA.");
        report.setTimelineInsightsJson(timelineJson);
        report.setAiAnalysisJson(aiAnalysisJson);
        report.setHumanReviewsJson(humanReviewsJson);
        report.setActionPlanJson(actionPlanJson);
        report.setActualDeliveryTime("24h");
        report.setDateCompleted(Instant.now());
        reportRepository.save(report);

        job.setStatus(JobStatus.DELIVERED);
        job.setReportCompiled(true);
        job.setHumanReviewComplete(true);
        job.setCompletedReviewers(job.getTotalRequiredReviewers());
        job.setDeliveredAt(Instant.now());
        job.setDeliveryTimeHours(24);
        jobRepository.save(job);

        return AdminDebugCompileResponse.builder()
                .jobId(job.getId())
                .reportId(report.getId())
                .status(report.getStatus().name())
                .build();
    }

    @Transactional
    public AdminDebugRequeueResponse requeueExpiredLeases() {
        ensureEnabled();
        int requeued = taskRepository.requeueExpiredLeases(Instant.now());
        return AdminDebugRequeueResponse.builder()
                .requeuedCount(requeued)
                .build();
    }

    private void ensureEnabled() {
        if (!debugEnabled) {
            throw new ForbiddenException("Debug tools are disabled in this environment.");
        }
    }

    private User getOrCreateCreator() {
        User user = userRepository.findByEmail(CREATOR_EMAIL)
                .orElseGet(() -> {
                    User created = User.builder()
                            .email(CREATOR_EMAIL)
                            .passwordHash(passwordEncoder.encode(DEBUG_PASSWORD))
                            .role(UserRole.CREATOR)
                            .enabled(true)
                            .emailVerified(true)
                            .build();
                    return userRepository.save(created);
                });

        creatorProfileRepository.findByUser(user)
                .orElseGet(() -> creatorProfileRepository.save(CreatorProfile.builder()
                        .user(user)
                        .name("Debug Creator")
                        .company("Content Diagnostics")
                        .primaryLanguage("English")
                        .planTier("basic")
                        .remainingCredits(5)
                        .build()));

        return user;
    }

    private ReviewerProfile getOrCreateReviewer() {
        return reviewerProfileRepository.findByUser(userRepository.findByEmail(REVIEWER_EMAIL)
                        .orElseGet(() -> {
                            User user = User.builder()
                                    .email(REVIEWER_EMAIL)
                                    .passwordHash(passwordEncoder.encode(DEBUG_PASSWORD))
                                    .role(UserRole.REVIEWER)
                                    .enabled(true)
                                    .emailVerified(true)
                                    .build();
                            return userRepository.save(user);
                        }))
                .orElseGet(() -> {
                    User user = userRepository.findByEmail(REVIEWER_EMAIL)
                            .orElseThrow(() -> new ResourceNotFoundException("User", REVIEWER_EMAIL));

                    ReviewerProfile profile = ReviewerProfile.builder()
                            .user(user)
                            .name("Debug Reviewer")
                            .language("English")
                            .qualificationPassed(true)
                            .queueLocked(false)
                            .qualityScore(95)
                            .build();
                    return reviewerProfileRepository.save(profile);
                });
    }

    private Task buildTask(Job job, String questionsJson, String timestamp, int start, int end, String language) {
        return Task.builder()
                .job(job)
                .status(TaskStatus.AVAILABLE)
                .language(language)
                .segmentTimestamp(timestamp)
                .segmentStartSeconds(start)
                .segmentEndSeconds(end)
                .payAmount(0.75)
                .videoSegmentUrl("https://example.com/debug/segment.mp4")
                .questionsJson(questionsJson)
                .attentionCheckIndex(2)
                .build();
    }

    private String buildSampleQuestionsJson() {
        List<TaskDto.TaskQuestion> questions = List.of(
                TaskDto.TaskQuestion.builder()
                        .id("clarity")
                        .question("How clear was the main message?")
                        .type("scale")
                        .options(List.of("1", "2", "3", "4", "5"))
                        .build(),
                TaskDto.TaskQuestion.builder()
                        .id("pacing")
                        .question("How was the pacing of this segment?")
                        .type("scale")
                        .options(List.of("1", "2", "3", "4", "5"))
                        .build(),
                TaskDto.TaskQuestion.builder()
                        .id("attention_check")
                        .question("Select \"Blue\" to confirm you watched the segment")
                        .type("attention-check")
                        .options(List.of("Red", "Blue", "Green"))
                        .build(),
                TaskDto.TaskQuestion.builder()
                        .id("feedback")
                        .question("What would you improve about this segment?")
                        .type("text")
                        .build()
        );

        try {
            return objectMapper.writeValueAsString(questions);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize debug questions", e);
        }
    }

    private Job resolveJob(Long jobId) {
        if (jobId != null) {
            return jobRepository.findById(jobId)
                    .orElseThrow(() -> new ResourceNotFoundException("Job", jobId.toString()));
        }

        return jobRepository.findAll(PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "createdAt")))
                .stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Job", "latest"));
    }

    private Report createStubReport(Job job) {
        Video video = job.getVideo();
        Report report = Report.builder()
                .creator(job.getCreator())
                .job(job)
                .status(ReportStatus.COMPILING)
                .videoTitle(video.getTitle())
                .duration("5:00")
                .videoDurationMinutes(5)
                .languagePool(job.getLanguage())
                .guaranteedReviewers(job.getTotalRequiredReviewers())
                .slaWindow(job.getSlaHours() + "h")
                .dateSubmitted(Instant.now())
                .seriesId(UUID.randomUUID().toString())
                .version(1)
                .build();
        return reportRepository.save(report);
    }
}
