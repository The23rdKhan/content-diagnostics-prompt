package com.contentdiagnostics.jobs.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.common.exception.BadRequestException;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.jobs.dto.JobDto;
import com.contentdiagnostics.jobs.dto.SubmitVideoRequest;
import com.contentdiagnostics.jobs.entity.Job;
import com.contentdiagnostics.jobs.entity.JobStatus;
import com.contentdiagnostics.jobs.repository.JobRepository;
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

        // Determine SLA hours based on add-ons
        int slaHours = 48; // Default
        if (request.getFasterDelivery() != null && request.getFasterDelivery()) {
            slaHours = 24;
        }

        int requiredReviewers = request.getRequiredReviewers() != null
                ? request.getRequiredReviewers()
                : 50;

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

        // TODO: Enqueue video processing event to SQS

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

    // --- Helper methods ---

    private JobDto mapToDto(Job job) {
        Video video = job.getVideo();

        String slaStatus = determineSlaStatus(job);
        String estimatedDeliveryWindow = calculateEstimatedDelivery(job);

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
