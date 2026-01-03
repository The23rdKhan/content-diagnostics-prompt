package com.contentdiagnostics.reports.service;

import com.contentdiagnostics.jobs.entity.Job;
import com.contentdiagnostics.jobs.entity.JobStatus;
import com.contentdiagnostics.jobs.repository.JobRepository;
import com.contentdiagnostics.reports.dto.ReportDto;
import com.contentdiagnostics.reports.entity.Report;
import com.contentdiagnostics.reports.entity.ReportStatus;
import com.contentdiagnostics.reports.repository.ReportRepository;
import com.contentdiagnostics.tasks.entity.Task;
import com.contentdiagnostics.tasks.entity.TaskStatus;
import com.contentdiagnostics.tasks.repository.TaskRepository;
import com.contentdiagnostics.videos.entity.Video;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for compiling review reports from completed tasks.
 * Aggregates scores and feedback from all approved tasks into a final report.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReportCompilationService {

    private final ReportRepository reportRepository;
    private final TaskRepository taskRepository;
    private final JobRepository jobRepository;
    private final ObjectMapper objectMapper;

    /**
     * Score mappings for scale questions.
     */
    private static final Map<String, Integer> CLARITY_SCORE_MAP = Map.of(
            "Very Unclear", 20,
            "Unclear", 40,
            "Neutral", 60,
            "Clear", 80,
            "Very Clear", 100
    );

    private static final Map<String, Integer> PACING_SCORE_MAP = Map.of(
            "Too Slow", 40,
            "Slightly Slow", 60,
            "Just Right", 100,
            "Slightly Fast", 60,
            "Too Fast", 40
    );

    private static final Map<String, Integer> NUMERIC_SCORE_MAP = Map.of(
            "1", 20,
            "2", 40,
            "3", 60,
            "4", 80,
            "5", 100
    );

    /**
     * Compiles a report from all approved tasks for a job.
     *
     * @param job The job to compile a report for
     * @return The compiled report
     */
    @Transactional
    public Report compileReport(Job job) {
        log.info("Compiling report for job {}", job.getId());

        // Get all approved tasks for this job
        List<Task> approvedTasks = taskRepository.findByJob(job).stream()
                .filter(t -> t.getStatus() == TaskStatus.APPROVED)
                .collect(Collectors.toList());

        if (approvedTasks.isEmpty()) {
            log.warn("No approved tasks found for job {}", job.getId());
        }

        // Aggregate scores
        ScoreAggregation scores = aggregateScores(approvedTasks);

        // Extract comments
        List<String> comments = extractComments(approvedTasks);

        // Extract timeline insights from timestamp issues
        List<ReportDto.TimelineInsight> timelineInsights = extractTimelineInsights(approvedTasks);

        // Build action plan based on scores
        List<ReportDto.ActionItem> actionPlan = buildActionPlan(scores, comments);

        // Get video info
        Video video = job.getVideo();

        // Check if report already exists
        Report report = reportRepository.findByJob(job).orElse(null);

        if (report == null) {
            report = Report.builder()
                    .creator(job.getCreator())
                    .job(job)
                    .build();
        }

        // Calculate delivery time
        long deliveryHours = ChronoUnit.HOURS.between(job.getCreatedAt(), Instant.now());

        // Update report fields
        report.setStatus(ReportStatus.DELIVERED);
        report.setVideoTitle(video.getTitle());
        report.setDuration(formatDuration(video.getDurationSeconds()));
        report.setVideoDurationMinutes(video.getDurationSeconds() != null ? video.getDurationSeconds() / 60 : null);
        report.setLanguagePool(job.getLanguage() != null ? job.getLanguage() : "English");
        report.setGuaranteedReviewers(job.getRequiredReviewers());
        report.setSlaWindow(job.getSlaHours() + " hours");
        report.setActualDeliveryTime(deliveryHours + " hours");
        report.setDateSubmitted(job.getCreatedAt());
        report.setDateCompleted(Instant.now());

        // Set scores
        report.setClarityScore(scores.clarityScore);
        report.setPacingScore(scores.pacingScore);
        report.setEngagementScore(scores.engagementScore);
        report.setStructureScore(scores.structureScore);

        // Generate executive summary
        report.setExecutiveSummary(generateExecutiveSummary(scores, approvedTasks.size()));

        // Set JSON content
        report.setTimelineInsightsJson(toJson(timelineInsights));
        report.setAiAnalysisJson(toJson(buildAiAnalysis()));
        report.setHumanReviewsJson(toJson(ReportDto.HumanReviews.builder()
                .engagementStats(approvedTasks.size() + " reviewers completed")
                .comments(comments)
                .build()));
        report.setActionPlanJson(toJson(actionPlan));

        report = reportRepository.save(report);

        // Update job status
        job.setStatus(JobStatus.DELIVERED);
        job.setReportCompiled(true);
        job.setDeliveredAt(Instant.now());
        job.setDeliveryTimeHours((int) deliveryHours);
        jobRepository.save(job);

        log.info("Report {} compiled for job {} with {} approved reviews",
                report.getId(), job.getId(), approvedTasks.size());

        return report;
    }

    /**
     * Aggregates scores from all approved tasks.
     */
    private ScoreAggregation aggregateScores(List<Task> tasks) {
        List<Integer> clarityScores = new ArrayList<>();
        List<Integer> pacingScores = new ArrayList<>();
        List<Integer> engagementScores = new ArrayList<>();
        List<Integer> structureScores = new ArrayList<>();

        for (Task task : tasks) {
            Map<String, String> answers = parseAnswers(task.getAnswersJson());
            if (answers == null) continue;

            // Clarity
            String clarity = answers.get("clarity");
            if (clarity != null && CLARITY_SCORE_MAP.containsKey(clarity)) {
                clarityScores.add(CLARITY_SCORE_MAP.get(clarity));
            }

            // Pacing
            String pacing = answers.get("pacing");
            if (pacing != null && PACING_SCORE_MAP.containsKey(pacing)) {
                pacingScores.add(PACING_SCORE_MAP.get(pacing));
            }

            // Engagement
            String engagement = answers.get("engagement");
            if (engagement != null && NUMERIC_SCORE_MAP.containsKey(engagement)) {
                engagementScores.add(NUMERIC_SCORE_MAP.get(engagement));
            }

            // Structure
            String structure = answers.get("structure");
            if (structure != null && NUMERIC_SCORE_MAP.containsKey(structure)) {
                structureScores.add(NUMERIC_SCORE_MAP.get(structure));
            }
        }

        return new ScoreAggregation(
                average(clarityScores),
                average(pacingScores),
                average(engagementScores),
                average(structureScores)
        );
    }

    /**
     * Extracts text feedback comments from tasks.
     */
    private List<String> extractComments(List<Task> tasks) {
        List<String> comments = new ArrayList<>();

        for (Task task : tasks) {
            Map<String, String> answers = parseAnswers(task.getAnswersJson());
            if (answers == null) continue;

            String feedback = answers.get("feedback");
            if (feedback != null && !feedback.trim().isEmpty()) {
                comments.add(feedback.trim());
            }
        }

        return comments;
    }

    /**
     * Extracts timeline insights from timestamp issue responses.
     */
    private List<ReportDto.TimelineInsight> extractTimelineInsights(List<Task> tasks) {
        Map<String, Integer> timestampCounts = new HashMap<>();

        for (Task task : tasks) {
            Map<String, String> answers = parseAnswers(task.getAnswersJson());
            if (answers == null) continue;

            String timestampIssue = answers.get("timestamp_issue");
            if (timestampIssue != null && !timestampIssue.trim().isEmpty()) {
                // Normalize timestamp format
                String normalized = normalizeTimestamp(timestampIssue.trim());
                if (normalized != null) {
                    timestampCounts.merge(normalized, 1, Integer::sum);
                }
            }
        }

        // Convert to timeline insights, sorted by frequency
        return timestampCounts.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(5) // Top 5 most mentioned timestamps
                .map(entry -> ReportDto.TimelineInsight.builder()
                        .timestamp(entry.getKey())
                        .observation("Multiple reviewers noted an issue at this point")
                        .severity(entry.getValue() >= 3 ? "critical" : entry.getValue() >= 2 ? "moderate" : "minor")
                        .category("clarity")
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Builds action plan based on scores and feedback.
     */
    private List<ReportDto.ActionItem> buildActionPlan(ScoreAggregation scores, List<String> comments) {
        List<ReportDto.ActionItem> actionPlan = new ArrayList<>();

        // Add action items based on low scores
        if (scores.clarityScore != null && scores.clarityScore < 60) {
            actionPlan.add(ReportDto.ActionItem.builder()
                    .action("Improve message clarity")
                    .why("Reviewers found the main message unclear (score: " + scores.clarityScore + "/100)")
                    .expectedResult("Higher viewer comprehension and retention")
                    .build());
        }

        if (scores.pacingScore != null && scores.pacingScore < 60) {
            actionPlan.add(ReportDto.ActionItem.builder()
                    .action("Adjust video pacing")
                    .why("Reviewers noted pacing issues (score: " + scores.pacingScore + "/100)")
                    .expectedResult("Better viewer engagement throughout the video")
                    .build());
        }

        if (scores.engagementScore != null && scores.engagementScore < 60) {
            actionPlan.add(ReportDto.ActionItem.builder()
                    .action("Increase content engagement")
                    .why("Engagement rated low by reviewers (score: " + scores.engagementScore + "/100)")
                    .expectedResult("Higher watch time and viewer interaction")
                    .build());
        }

        if (scores.structureScore != null && scores.structureScore < 60) {
            actionPlan.add(ReportDto.ActionItem.builder()
                    .action("Improve video structure")
                    .why("Structure needs work (score: " + scores.structureScore + "/100)")
                    .expectedResult("Clearer narrative flow and easier following")
                    .build());
        }

        // If all scores are good, add positive reinforcement
        if (actionPlan.isEmpty()) {
            actionPlan.add(ReportDto.ActionItem.builder()
                    .action("Continue current approach")
                    .why("All metrics scored well across reviewers")
                    .expectedResult("Maintain strong viewer engagement")
                    .build());
        }

        return actionPlan;
    }

    /**
     * Generates executive summary based on scores.
     */
    private String generateExecutiveSummary(ScoreAggregation scores, int reviewerCount) {
        int avgScore = average(List.of(
                scores.clarityScore != null ? scores.clarityScore : 0,
                scores.pacingScore != null ? scores.pacingScore : 0,
                scores.engagementScore != null ? scores.engagementScore : 0,
                scores.structureScore != null ? scores.structureScore : 0
        ));

        String overallRating;
        if (avgScore >= 80) {
            overallRating = "excellent";
        } else if (avgScore >= 60) {
            overallRating = "good with room for improvement";
        } else if (avgScore >= 40) {
            overallRating = "needs attention in several areas";
        } else {
            overallRating = "requires significant improvements";
        }

        return String.format(
                "Based on feedback from %d paid reviewers, your video is rated as %s. " +
                        "Clarity: %d/100, Pacing: %d/100, Engagement: %d/100, Structure: %d/100. " +
                        "Review the detailed feedback and action items below for specific improvements.",
                reviewerCount,
                overallRating,
                scores.clarityScore != null ? scores.clarityScore : 0,
                scores.pacingScore != null ? scores.pacingScore : 0,
                scores.engagementScore != null ? scores.engagementScore : 0,
                scores.structureScore != null ? scores.structureScore : 0
        );
    }

    /**
     * Builds placeholder AI analysis (to be replaced with actual AI processing).
     */
    private ReportDto.AiAnalysis buildAiAnalysis() {
        return ReportDto.AiAnalysis.builder()
                .monologueStretches(List.of())
                .silenceDowntime(List.of())
                .topicDrift(List.of())
                .energyVariance(List.of())
                .build();
    }

    // --- Utility methods ---

    private Map<String, String> parseAnswers(String answersJson) {
        if (answersJson == null) return null;
        try {
            return objectMapper.readValue(answersJson, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            log.error("Failed to parse answers JSON", e);
            return null;
        }
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize to JSON", e);
            return null;
        }
    }

    private Integer average(List<Integer> values) {
        if (values == null || values.isEmpty()) return null;
        return (int) values.stream()
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0);
    }

    private String formatDuration(Integer seconds) {
        if (seconds == null) return "Unknown";
        int minutes = seconds / 60;
        int secs = seconds % 60;
        return String.format("%d:%02d", minutes, secs);
    }

    private String normalizeTimestamp(String timestamp) {
        // Try to extract timestamp in format like "2:30", "02:30", "2:30s", etc.
        String cleaned = timestamp.replaceAll("[^0-9:]", "");
        if (cleaned.contains(":")) {
            return cleaned;
        }
        // Try to interpret as seconds
        try {
            int secs = Integer.parseInt(cleaned);
            return (secs / 60) + ":" + String.format("%02d", secs % 60);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * Internal class for score aggregation.
     */
    private record ScoreAggregation(
            Integer clarityScore,
            Integer pacingScore,
            Integer engagementScore,
            Integer structureScore
    ) {}
}
