package com.contentdiagnostics.jobs.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.common.exception.BadRequestException;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.credits.service.CreditService;
import com.contentdiagnostics.jobs.dto.JobDto;
import com.contentdiagnostics.jobs.dto.SubmitVideoRequest;
import com.contentdiagnostics.jobs.entity.Job;
import com.contentdiagnostics.jobs.entity.JobStatus;
import com.contentdiagnostics.jobs.repository.JobRepository;
import com.contentdiagnostics.notifications.entity.NotificationType;
import com.contentdiagnostics.notifications.service.NotificationService;
import com.contentdiagnostics.reports.entity.Report;
import com.contentdiagnostics.reports.repository.ReportRepository;
import com.contentdiagnostics.tasks.service.TaskCreationService;
import com.contentdiagnostics.videos.entity.Video;
import com.contentdiagnostics.videos.entity.VideoStatus;
import com.contentdiagnostics.videos.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for job operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final VideoRepository videoRepository;
    private final ReportRepository reportRepository;
    private final TaskCreationService taskCreationService;
    private final CreditService creditService;
    private final NotificationService notificationService;

    /**
     * Get all jobs for a creator.
     */
    @Transactional(readOnly = true)
    public List<JobDto> getCreatorJobs(User creator) {
        List<Job> jobs = jobRepository.findByCreatorOrderByCreatedAtDesc(creator);
        return jobs.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    /**
     * Submit a video for review (create a job).
     */
    @Transactional
    public JobDto submitVideoForReview(User creator, Long videoId, SubmitVideoRequest request) {
        Video video = videoRepository.findByIdAndCreator(videoId, creator)
                .orElseThrow(() -> new ResourceNotFoundException("Video", videoId.toString()));

        if (video.getStatus() != VideoStatus.READY && video.getStatus() != VideoStatus.UPLOADED) {
            throw new BadRequestException("Video is not ready for review submission", "VIDEO_NOT_READY");
        }

        // Deduct credits atomically FIRST - this will throw if insufficient credits
        int creditsRequired = CreditService.CREDITS_PER_VIDEO;

        // Determine SLA hours based on add-ons
        int slaHours = 48; // Default
        if (request.getFasterDelivery() != null && request.getFasterDelivery()) {
            slaHours = 24;
        }

        int requiredReviewers = request.getRequiredReviewers() != null
                ? request.getRequiredReviewers()
                : 10; // Default to Professional tier (5/10/15 for basic/pro/enterprise)

        Job job = Job.builder()
                .creator(creator)
                .video(video)
                .status(JobStatus.UPLOADED)
                .language(video.getLanguage())
                .slaHours(slaHours)
                .requiredReviewers(requiredReviewers)
                .extraReviewers(request.getExtraReviewers())
                .fasterDelivery(request.getFasterDelivery() != null && request.getFasterDelivery())
                .fullWatchSummary(request.getFullWatchSummary() != null && request.getFullWatchSummary())
                .liveFeedback(request.getLiveFeedback() != null && request.getLiveFeedback())
                .slaDeadline(Instant.now().plus(slaHours, ChronoUnit.HOURS))
                .build();

        job = jobRepository.save(job);

        log.info("Job {} created for video {} by creator {}", job.getId(), videoId, creator.getId());

        // Deduct credits atomically - throws BadRequestException if insufficient
        try {
            creditService.deductCreditsForVideo(creator, job.getId(), creditsRequired);
            log.info("Deducted {} credits for job {}", creditsRequired, job.getId());
        } catch (Exception e) {
            // If credit deduction fails, delete the job and re-throw
            log.error("Failed to deduct credits for job {}, rolling back job creation", job.getId());
            jobRepository.delete(job);
            throw e;
        }

        // Create tasks for reviewers
        taskCreationService.createTasksForJob(job, video);

        // Update job status to segmented (tasks created, awaiting human review)
        job.setStatus(JobStatus.SEGMENTED);
        job = jobRepository.save(job);

        log.info("Job {} is now ready for review with {} tasks", job.getId(), job.getRequiredReviewers());

        // Notify creator that video is being processed
        notificationService.createNotification(
                creator,
                NotificationType.UPLOAD_RECEIVED,
                Map.of("videoTitle", video.getTitle())
        );

        return mapToDto(job);
    }

    /**
     * Get job by ID for creator.
     */
    @Transactional(readOnly = true)
    public JobDto getJob(User creator, Long jobId) {
        Job job = jobRepository.findByIdAndCreator(jobId, creator)
                .orElseThrow(() -> new ResourceNotFoundException("Job", jobId.toString()));
        return mapToDto(job);
    }

    /**
     * Cancel a job and refund credits.
     */
    @Transactional
    public JobDto cancelJob(User user, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", jobId.toString()));

        // Verify ownership
        if (!job.getCreator().getId().equals(user.getId())) {
            throw new BadRequestException("Not authorized to cancel this job");
        }

        // Check if cancellable
        if (!isCancellable(job.getStatus())) {
            throw new BadRequestException("Job cannot be cancelled in status: " + job.getStatus());
        }

        // Update status to CANCELLED
        jobRepository.updateStatus(jobId, JobStatus.CANCELLED);

        // Refund credits
        creditService.refundCredits(user, jobId, CreditService.CREDITS_PER_VIDEO, "Job cancelled by user");

        // Return updated job
        job.setStatus(JobStatus.CANCELLED);
        return mapToDto(job);
    }

    /**
     * Check if a job can be cancelled based on its status.
     */
    private boolean isCancellable(JobStatus status) {
        return status == JobStatus.UPLOADING
            || status == JobStatus.UPLOADED
            || status == JobStatus.PROCESSING
            || status == JobStatus.SEGMENTED
            || status == JobStatus.IN_REVIEW;
    }

    // --- Helper methods ---

    private JobDto mapToDto(Job job) {
        Video video = job.getVideo();

        String slaStatus = determineSlaStatus(job);
        String estimatedDeliveryWindow = calculateEstimatedDelivery(job);

        // Get report ID if job is delivered
        Long reportId = null;
        if (job.getStatus() == JobStatus.DELIVERED) {
            reportId = reportRepository.findByJob(job)
                    .map(Report::getId)
                    .orElse(null);
        }

        return JobDto.builder()
                .id(job.getId())
                .videoId(video.getId())
                .videoTitle(video.getTitle())
                .fileName(video.getFileName())
                .fileSize(video.getFileSize())
                .status(job.getStatus())
                .language(job.getLanguage())
                .slaHours(job.getSlaHours())
                .requiredReviewers(job.getRequiredReviewers())
                .completedReviewers(job.getCompletedReviewers())
                .totalReviewers(job.getTotalRequiredReviewers())
                .extraReviewers(job.getExtraReviewers())
                .fasterDelivery(job.getFasterDelivery())
                .fullWatchSummary(job.getFullWatchSummary())
                .liveFeedback(job.getLiveFeedback())
                .timeline(JobDto.TimelineDto.builder()
                        .aiDiagnostics(job.getAiDiagnosticsComplete() ? "complete" : "pending")
                        .humanReview(determineHumanReviewStatus(job))
                        .compilingReport(determineCompilingStatus(job))
                        .build())
                .progress(JobDto.ProgressDto.builder()
                        .reviewersCompleted(job.getCompletedReviewers())
                        .totalReviewers(job.getTotalRequiredReviewers())
                        .build())
                .slaStatus(slaStatus)
                .deliveryTimeHours(job.getDeliveryTimeHours())
                .estimatedDeliveryWindow(estimatedDeliveryWindow)
                .createdAt(job.getCreatedAt())
                .deliveredAt(job.getDeliveredAt())
                .reportId(reportId)
                .build();
    }

    private String determineSlaStatus(Job job) {
        if (job.getStatus() == JobStatus.DELIVERED) {
            if (job.getDeliveryTimeHours() != null && job.getDeliveryTimeHours() < job.getSlaHours()) {
                return "delivered-early";
            } else if (job.getDeliveryTimeHours() != null && job.getDeliveryTimeHours() > job.getSlaHours()) {
                return "delivered-late";
            }
            return "on-time";
        }

        if (job.isSlaAtRisk()) {
            return "at-risk";
        }

        return "on-time";
    }

    private String calculateEstimatedDelivery(Job job) {
        if (job.getStatus() == JobStatus.DELIVERED) {
            return null;
        }

        if (job.getSlaDeadline() == null) {
            return job.getSlaHours() + " hours";
        }

        long hoursRemaining = ChronoUnit.HOURS.between(Instant.now(), job.getSlaDeadline());

        if (hoursRemaining <= 0) {
            return "Overdue";
        } else if (hoursRemaining <= 4) {
            return hoursRemaining + " hours remaining";
        } else {
            return hoursRemaining / 24 + "-" + (hoursRemaining / 24 + 1) + " hours";
        }
    }

    private String determineHumanReviewStatus(Job job) {
        if (job.getHumanReviewComplete()) {
            return "complete";
        }
        if (job.getStatus() == JobStatus.IN_REVIEW) {
            return "in-progress";
        }
        return "pending";
    }

    private String determineCompilingStatus(Job job) {
        if (job.getReportCompiled()) {
            return "complete";
        }
        if (job.getStatus() == JobStatus.COMPILING) {
            return "in-progress";
        }
        return "pending";
    }
}
