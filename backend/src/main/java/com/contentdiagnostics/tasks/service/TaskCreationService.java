package com.contentdiagnostics.tasks.service;

import com.contentdiagnostics.jobs.entity.Job;
import com.contentdiagnostics.tasks.dto.TaskDto;
import com.contentdiagnostics.tasks.entity.Task;
import com.contentdiagnostics.tasks.entity.TaskStatus;
import com.contentdiagnostics.tasks.repository.TaskRepository;
import com.contentdiagnostics.videos.entity.Video;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for creating review tasks for jobs.
 * For MVP: Creates N tasks for the full video (no segmentation).
 * Future: Will segment videos into smaller reviewable chunks.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TaskCreationService {

    private final TaskRepository taskRepository;
    private final ObjectMapper objectMapper;

    /**
     * Default pay amount per task.
     */
    private static final double DEFAULT_PAY_AMOUNT = 0.30;

    /**
     * Index of attention check question (0-based).
     */
    private static final int ATTENTION_CHECK_INDEX = 3;

    /**
     * Creates tasks for a job based on the required number of reviewers.
     * Each task represents one reviewer reviewing the full video.
     *
     * @param job   The job to create tasks for
     * @param video The video being reviewed
     * @return List of created tasks
     */
    @Transactional
    public List<Task> createTasksForJob(Job job, Video video) {
        int taskCount = job.getRequiredReviewers();
        List<Task> tasks = new ArrayList<>();

        String questionsJson = buildStandardQuestions();
        int videoDurationSeconds = video.getDurationSeconds() != null ? video.getDurationSeconds() : 0;
        String segmentTimestamp = formatTimestamp(0, videoDurationSeconds);

        for (int i = 0; i < taskCount; i++) {
            Task task = Task.builder()
                    .job(job)
                    .status(TaskStatus.AVAILABLE)
                    .language(job.getLanguage() != null ? job.getLanguage() : "English")
                    .segmentTimestamp(segmentTimestamp)
                    .segmentStartSeconds(0)
                    .segmentEndSeconds(videoDurationSeconds)
                    .payAmount(DEFAULT_PAY_AMOUNT)
                    .videoSegmentUrl(video.getStorageUrl())
                    .questionsJson(questionsJson)
                    .attentionCheckIndex(ATTENTION_CHECK_INDEX)
                    .build();

            tasks.add(task);
        }

        List<Task> savedTasks = taskRepository.saveAll(tasks);
        log.info("Created {} tasks for job {} (video: {})",
                savedTasks.size(), job.getId(), video.getId());

        return savedTasks;
    }

    /**
     * Builds the standard questions JSON for review tasks.
     * Questions include clarity, pacing, engagement, attention check, and open feedback.
     */
    private String buildStandardQuestions() {
        List<TaskDto.TaskQuestion> questions = List.of(
                TaskDto.TaskQuestion.builder()
                        .id("clarity")
                        .question("How clear was the main message of this video?")
                        .type("scale")
                        .options(List.of("Very Unclear", "Unclear", "Neutral", "Clear", "Very Clear"))
                        .build(),
                TaskDto.TaskQuestion.builder()
                        .id("pacing")
                        .question("How was the pacing of the video?")
                        .type("scale")
                        .options(List.of("Too Slow", "Slightly Slow", "Just Right", "Slightly Fast", "Too Fast"))
                        .build(),
                TaskDto.TaskQuestion.builder()
                        .id("engagement")
                        .question("How engaging was the content?")
                        .type("scale")
                        .options(List.of("1", "2", "3", "4", "5"))
                        .build(),
                TaskDto.TaskQuestion.builder()
                        .id("attention_check")
                        .question("To confirm you watched the video, please select 'Blue'")
                        .type("attention-check")
                        .options(List.of("Red", "Blue", "Green", "Yellow"))
                        .build(),
                TaskDto.TaskQuestion.builder()
                        .id("structure")
                        .question("How well-structured was the video?")
                        .type("scale")
                        .options(List.of("1", "2", "3", "4", "5"))
                        .build(),
                TaskDto.TaskQuestion.builder()
                        .id("feedback")
                        .question("What specific improvements would you suggest for this video?")
                        .type("text")
                        .build(),
                TaskDto.TaskQuestion.builder()
                        .id("timestamp_issue")
                        .question("At what timestamp did you notice the biggest issue? (e.g., 2:30)")
                        .type("text")
                        .build()
        );

        try {
            return objectMapper.writeValueAsString(questions);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize questions JSON", e);
            throw new IllegalStateException("Failed to build questions JSON", e);
        }
    }

    /**
     * Formats a timestamp range string from start and end seconds.
     *
     * @param startSeconds Start time in seconds
     * @param endSeconds   End time in seconds
     * @return Formatted string like "0:00-5:30" or "0:00-end"
     */
    private String formatTimestamp(int startSeconds, int endSeconds) {
        if (endSeconds == 0) {
            return "0:00-end";
        }

        String start = formatTime(startSeconds);
        String end = formatTime(endSeconds);
        return start + "-" + end;
    }

    /**
     * Formats seconds into mm:ss format.
     */
    private String formatTime(int totalSeconds) {
        int minutes = totalSeconds / 60;
        int seconds = totalSeconds % 60;
        return String.format("%d:%02d", minutes, seconds);
    }
}
