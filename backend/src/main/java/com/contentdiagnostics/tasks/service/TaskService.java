package com.contentdiagnostics.tasks.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.common.exception.BadRequestException;
import com.contentdiagnostics.common.exception.ForbiddenException;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.jobs.entity.Job;
import com.contentdiagnostics.jobs.entity.JobStatus;
import com.contentdiagnostics.jobs.repository.JobRepository;
import com.contentdiagnostics.reports.service.ReportCompilationService;
import com.contentdiagnostics.reviewers.entity.ReviewerProfile;
import com.contentdiagnostics.workers.publisher.SqsPublisher;
import com.contentdiagnostics.reviewers.repository.ReviewerProfileRepository;
import com.contentdiagnostics.tasks.dto.TaskDto;
import com.contentdiagnostics.tasks.dto.TaskHistoryResponse;
import com.contentdiagnostics.tasks.dto.TaskSubmissionRequest;
import com.contentdiagnostics.tasks.entity.Task;
import com.contentdiagnostics.tasks.entity.TaskStatus;
import com.contentdiagnostics.tasks.repository.TaskRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for task operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ReviewerProfileRepository reviewerProfileRepository;
    private final JobRepository jobRepository;
    private final ReportCompilationService reportCompilationService;
    private final SqsPublisher sqsPublisher;
    private final ObjectMapper objectMapper;

    @Value("${app.task.lease-duration-minutes:10}")
    private int leaseDurationMinutes;

    @Value("${app.task.min-watch-ratio:0.70}")
    private double minWatchRatio;

    @Value("${app.task.min-completion-time-seconds:30}")
    private int minCompletionTimeSeconds;

    @Value("${app.reviewer.score-decrease-on-reject:5}")
    private int scoreDecreaseOnReject;

    @Value("${app.reviewer.score-increase-on-approve:1}")
    private int scoreIncreaseOnApprove;

    /**
     * Get available tasks for a reviewer.
     */
    @Transactional(readOnly = true)
    public List<TaskDto> getAvailableTasks(User user, String status) {
        ReviewerProfile reviewer = getReviewerProfile(user);

        if (!reviewer.canAccessQueue()) {
            throw new ForbiddenException("Queue access is locked. Complete qualification or improve quality score.");
        }

        List<Task> tasks;
        if ("AVAILABLE".equalsIgnoreCase(status)) {
            tasks = taskRepository.findAvailableByLanguage(
                    reviewer.getLanguage(),
                    PageRequest.of(0, 20)
            );
        } else {
            tasks = taskRepository.findByReviewerAndStatus(reviewer, TaskStatus.valueOf(status));
        }

        return tasks.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    /**
     * Accept (lease) a task.
     */
    @Transactional
    public TaskDto acceptTask(User user, Long taskId) {
        ReviewerProfile reviewer = getReviewerProfile(user);

        if (!reviewer.canAccessQueue()) {
            throw new ForbiddenException("Queue access is locked");
        }

        Instant leaseExpiry = Instant.now().plus(leaseDurationMinutes, ChronoUnit.MINUTES);

        // Atomic lease operation
        int updated = taskRepository.leaseTask(taskId, reviewer, leaseExpiry);

        if (updated == 0) {
            throw new BadRequestException("Task is not available", "TASK_NOT_AVAILABLE");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId.toString()));

        log.info("Task {} leased to reviewer {}", taskId, reviewer.getId());

        return mapToDto(task);
    }

    /**
     * Release a leased task (reviewer gives up the task).
     */
    @Transactional
    public void releaseTask(Long taskId, User user) {
        ReviewerProfile reviewer = getReviewerProfile(user);

        int updated = taskRepository.releaseTask(taskId, reviewer.getId());

        if (updated == 0) {
            throw new BadRequestException("Cannot release task - not leased by you", "RELEASE_FAILED");
        }

        log.info("Task {} released by reviewer {}", taskId, reviewer.getId());
    }

    /**
     * Submit a completed task.
     */
    @Transactional
    public TaskDto submitTask(User user, Long taskId, TaskSubmissionRequest request) {
        ReviewerProfile reviewer = getReviewerProfile(user);

        Task task = taskRepository.findByIdAndReviewer(taskId, reviewer)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId.toString()));

        // Validate task state
        if (task.getStatus() != TaskStatus.LEASED && task.getStatus() != TaskStatus.IN_PROGRESS) {
            throw new BadRequestException("Task cannot be submitted in current state", "INVALID_TASK_STATE");
        }

        // Check lease expiration
        if (task.isLeaseExpired()) {
            throw new BadRequestException("Task lease has expired", "LEASE_EXPIRED");
        }

        // Convert answers to JSON
        String answersJson;
        try {
            answersJson = objectMapper.writeValueAsString(request.getAnswers());
        } catch (JsonProcessingException e) {
            throw new BadRequestException("Invalid answers format");
        }

        int updated = taskRepository.submitTask(
                taskId,
                reviewer.getId(),
                Instant.now(),
                answersJson,
                request.getWatchRatio(),
                request.getCompletionTimeSeconds()
        );

        if (updated == 0) {
            throw new BadRequestException("Failed to submit task", "SUBMISSION_FAILED");
        }

        log.info("Task {} submitted by reviewer {}", taskId, reviewer.getId());

        // Get the updated task for QC event
        Task updatedTask = taskRepository.findById(taskId).orElseThrow();

        // Trigger async QC processing via SQS
        sqsPublisher.publishQcEvent(updatedTask);

        return mapToDto(updatedTask);
    }

    /**
     * Process QC for a task.
     */
    @Transactional
    public void processQc(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId.toString()));

        if (task.getStatus() != TaskStatus.SUBMITTED) {
            log.warn("Task {} not in SUBMITTED state for QC", taskId);
            return;
        }

        ReviewerProfile reviewer = task.getReviewer();
        boolean passed = true;
        String rejectionReason = null;

        // QC Rule 1: Check attention check
        boolean attentionPassed = checkAttentionCheck(task);
        if (!attentionPassed) {
            passed = false;
            rejectionReason = "Attention check failed";
        }

        // QC Rule 2: Check watch ratio
        if (passed && task.getWatchRatio() != null && task.getWatchRatio() < minWatchRatio) {
            passed = false;
            rejectionReason = String.format("Watch ratio %.2f below minimum %.2f",
                    task.getWatchRatio(), minWatchRatio);
        }

        // QC Rule 3: Check completion time
        if (passed && task.getCompletionTimeSeconds() != null
                && task.getCompletionTimeSeconds() < minCompletionTimeSeconds) {
            passed = false;
            rejectionReason = String.format("Completion time %ds below minimum %ds",
                    task.getCompletionTimeSeconds(), minCompletionTimeSeconds);
        }

        Instant reviewedAt = Instant.now();

        if (passed) {
            taskRepository.approveTask(taskId, reviewedAt, attentionPassed);
            reviewerProfileRepository.recordApproval(
                    reviewer.getId(),
                    task.getPayAmount(),
                    scoreIncreaseOnApprove
            );
            jobRepository.incrementCompletedReviewers(task.getJob().getId());
            log.info("Task {} approved", taskId);
        } else {
            taskRepository.rejectTask(taskId, reviewedAt, rejectionReason, attentionPassed);
            reviewerProfileRepository.recordRejection(reviewer.getId(), scoreDecreaseOnReject);
            log.info("Task {} rejected: {}", taskId, rejectionReason);
        }

        // Check if job is complete and trigger report compilation
        checkJobCompletionAndCompileReport(task.getJob());
    }

    /**
     * Checks if all tasks for a job are processed and triggers report compilation.
     */
    private void checkJobCompletionAndCompileReport(Job job) {
        long approvedCount = taskRepository.countByJobAndStatus(job, TaskStatus.APPROVED);
        long rejectedCount = taskRepository.countByJobAndStatus(job, TaskStatus.REJECTED);
        long totalProcessed = approvedCount + rejectedCount;
        int requiredReviewers = job.getRequiredReviewers();

        log.debug("Job {} progress: {}/{} tasks processed ({} approved, {} rejected)",
                job.getId(), totalProcessed, requiredReviewers, approvedCount, rejectedCount);

        // Check if all tasks have been processed
        if (totalProcessed >= requiredReviewers) {
            log.info("Job {} is complete with {} approved and {} rejected tasks",
                    job.getId(), approvedCount, rejectedCount);

            // Update job status
            job.setStatus(JobStatus.COMPILING);
            job.setHumanReviewComplete(true);
            jobRepository.save(job);

            // Compile the report
            try {
                reportCompilationService.compileReport(job);
                log.info("Report compiled for job {}", job.getId());
            } catch (Exception e) {
                log.error("Failed to compile report for job {}", job.getId(), e);
                job.setStatus(JobStatus.FAILED);
                jobRepository.save(job);
            }
        }
    }

    /**
     * Get task history for a reviewer.
     */
    @Transactional(readOnly = true)
    public TaskHistoryResponse getTaskHistory(User user, int page, int size) {
        ReviewerProfile reviewer = getReviewerProfile(user);

        Page<Task> taskPage = taskRepository.findByReviewer(
                reviewer,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        List<TaskDto> tasks = taskPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return TaskHistoryResponse.builder()
                .tasks(tasks)
                .page(taskPage.getNumber())
                .size(taskPage.getSize())
                .totalElements(taskPage.getTotalElements())
                .totalPages(taskPage.getTotalPages())
                .stats(TaskHistoryResponse.TaskStats.builder()
                        .totalCompleted(reviewer.getTasksCompleted())
                        .approved(reviewer.getTasksApproved())
                        .rejected(reviewer.getTasksRejected())
                        .approvalRate(reviewer.getApprovalRate())
                        .build())
                .build();
    }

    // --- Helper methods ---

    private ReviewerProfile getReviewerProfile(User user) {
        return reviewerProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer profile", user.getId().toString()));
    }

    private boolean checkAttentionCheck(Task task) {
        if (task.getAttentionCheckIndex() == null || task.getAnswersJson() == null) {
            return true; // No attention check configured
        }

        try {
            // Parse questions JSON
            List<TaskDto.TaskQuestion> questions = parseQuestions(task.getQuestionsJson());

            if (task.getAttentionCheckIndex() >= questions.size()) {
                return true;
            }

            TaskDto.TaskQuestion attentionQuestion = questions.get(task.getAttentionCheckIndex());

            // Parse answers JSON
            var answers = objectMapper.readValue(task.getAnswersJson(),
                    new TypeReference<java.util.Map<String, Object>>() {});

            // TODO: Implement actual attention check validation
            // For now, just check if the question was answered
            return answers.containsKey(attentionQuestion.getId());
        } catch (Exception e) {
            log.error("Error checking attention check for task {}", task.getId(), e);
            return true; // Don't fail on parsing errors
        }
    }

    private List<TaskDto.TaskQuestion> parseQuestions(String questionsJson) {
        if (questionsJson == null) {
            return List.of();
        }
        try {
            return objectMapper.readValue(questionsJson, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            return List.of();
        }
    }

    private TaskDto mapToDto(Task task) {
        return TaskDto.builder()
                .id(task.getId())
                .status(task.getStatus())
                .language(task.getLanguage())
                .segmentTimestamp(task.getSegmentTimestamp())
                .segmentDurationSeconds(task.getSegmentDuration())
                .payAmount(task.getPayAmount())
                .videoSegmentUrl(task.getVideoSegmentUrl())
                .questions(parseQuestions(task.getQuestionsJson()))
                .attentionCheckIndex(task.getAttentionCheckIndex())
                .leaseExpiresAt(task.getLeaseExpiresAt())
                .submittedAt(task.getSubmittedAt())
                .reviewedAt(task.getReviewedAt())
                .rejectionReason(task.getRejectionReason())
                .createdAt(task.getCreatedAt())
                .build();
    }
}
