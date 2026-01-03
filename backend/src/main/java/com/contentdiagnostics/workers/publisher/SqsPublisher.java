package com.contentdiagnostics.workers.publisher;

import com.contentdiagnostics.common.config.CorrelationIdFilter;
import com.contentdiagnostics.jobs.entity.Job;
import com.contentdiagnostics.tasks.entity.Task;
import com.contentdiagnostics.videos.entity.Video;
import com.contentdiagnostics.workers.config.SqsConfig;
import com.contentdiagnostics.workers.event.QcEvent;
import com.contentdiagnostics.workers.event.ReportCompilationEvent;
import com.contentdiagnostics.workers.event.VideoProcessingEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.MessageAttributeValue;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;
import software.amazon.awssdk.services.sqs.model.SendMessageResponse;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Service for publishing events to SQS queues.
 * Handles correlation ID propagation for distributed tracing.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SqsPublisher {

    private final SqsClient sqsClient;
    private final SqsConfig sqsConfig;
    private final ObjectMapper objectMapper;

    /**
     * Publishes a QC event for task quality control processing.
     *
     * @param task The task to process QC for
     * @return The SQS message ID, or null if publishing failed
     */
    public String publishQcEvent(Task task) {
        if (sqsConfig.getQcQueue() == null || sqsConfig.getQcQueue().isEmpty()) {
            log.warn("QC queue URL not configured, skipping QC event publish for task {}", task.getId());
            return null;
        }

        QcEvent event = QcEvent.builder()
                .taskId(task.getId())
                .jobId(task.getJob().getId())
                .reviewerId(task.getReviewer() != null ? task.getReviewer().getId() : null)
                .build();

        return publishEvent(sqsConfig.getQcQueue(), event, "QC_EVENT");
    }

    /**
     * Publishes a report compilation event.
     *
     * @param job The job to compile a report for
     * @return The SQS message ID, or null if publishing failed
     */
    public String publishReportCompilationEvent(Job job) {
        if (sqsConfig.getReportCompilationQueue() == null || sqsConfig.getReportCompilationQueue().isEmpty()) {
            log.warn("Report compilation queue URL not configured, skipping event publish for job {}", job.getId());
            return null;
        }

        ReportCompilationEvent event = ReportCompilationEvent.builder()
                .jobId(job.getId())
                .build();

        return publishEvent(sqsConfig.getReportCompilationQueue(), event, "REPORT_COMPILATION_EVENT");
    }

    /**
     * Publishes a video processing event after upload completes.
     *
     * @param video The video to process
     * @return The SQS message ID, or null if publishing failed
     */
    public String publishVideoProcessingEvent(Video video) {
        if (sqsConfig.getVideoProcessingQueue() == null || sqsConfig.getVideoProcessingQueue().isEmpty()) {
            log.warn("Video processing queue URL not configured, skipping event publish for video {}", video.getId());
            return null;
        }

        VideoProcessingEvent event = VideoProcessingEvent.builder()
                .videoId(video.getId())
                .storageKey(video.getStorageKey())
                .eventType("UPLOADED")
                .build();

        return publishEvent(sqsConfig.getVideoProcessingQueue(), event, "VIDEO_PROCESSING_EVENT");
    }

    /**
     * Generic method to publish an event to an SQS queue.
     *
     * @param queueUrl    The SQS queue URL
     * @param event       The event object to serialize and send
     * @param messageType The type of message for logging/tracking
     * @return The SQS message ID, or null if publishing failed
     */
    private String publishEvent(String queueUrl, Object event, String messageType) {
        try {
            String body = objectMapper.writeValueAsString(event);

            // Build message attributes with correlation ID
            Map<String, MessageAttributeValue> attributes = buildMessageAttributes(messageType);

            SendMessageRequest request = SendMessageRequest.builder()
                    .queueUrl(queueUrl)
                    .messageBody(body)
                    .messageAttributes(attributes)
                    .build();

            SendMessageResponse response = sqsClient.sendMessage(request);

            log.info("Published {} to SQS: messageId={}", messageType, response.messageId());

            return response.messageId();

        } catch (JsonProcessingException e) {
            log.error("Failed to serialize {} event", messageType, e);
            return null;
        } catch (Exception e) {
            log.error("Failed to publish {} to SQS", messageType, e);
            return null;
        }
    }

    /**
     * Builds message attributes including correlation ID for distributed tracing.
     */
    private Map<String, MessageAttributeValue> buildMessageAttributes(String messageType) {
        Map<String, MessageAttributeValue> attributes = new HashMap<>();

        // Propagate correlation ID from MDC or generate new one
        String correlationId = MDC.get(CorrelationIdFilter.CORRELATION_ID_MDC_KEY);
        if (correlationId == null || correlationId.isEmpty()) {
            correlationId = UUID.randomUUID().toString();
        }

        attributes.put("correlationId", MessageAttributeValue.builder()
                .dataType("String")
                .stringValue(correlationId)
                .build());

        attributes.put("messageType", MessageAttributeValue.builder()
                .dataType("String")
                .stringValue(messageType)
                .build());

        return attributes;
    }
}
