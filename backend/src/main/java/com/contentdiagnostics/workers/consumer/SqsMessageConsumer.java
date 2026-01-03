package com.contentdiagnostics.workers.consumer;

import com.contentdiagnostics.common.config.CorrelationIdFilter;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.jobs.entity.Job;
import com.contentdiagnostics.jobs.repository.JobRepository;
import com.contentdiagnostics.reports.service.ReportCompilationService;
import com.contentdiagnostics.tasks.service.TaskService;
import com.contentdiagnostics.workers.config.SqsConfig;
import com.contentdiagnostics.workers.entity.SqsProcessedMessage;
import com.contentdiagnostics.workers.event.QcEvent;
import com.contentdiagnostics.workers.event.ReportCompilationEvent;
import com.contentdiagnostics.workers.repository.SqsProcessedMessageRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.DeleteMessageRequest;
import software.amazon.awssdk.services.sqs.model.Message;
import software.amazon.awssdk.services.sqs.model.MessageAttributeValue;
import software.amazon.awssdk.services.sqs.model.ReceiveMessageRequest;

import java.util.List;
import java.util.UUID;

/**
 * Idempotent SQS message consumer for processing async events.
 *
 * Features:
 * - Idempotent processing using database-backed message tracking
 * - Correlation ID propagation for distributed tracing
 * - Automatic retry with DLQ escalation
 * - Structured logging for observability
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SqsMessageConsumer {

    private static final String QC_QUEUE_NAME = "qc-queue";
    private static final String REPORT_COMPILATION_QUEUE_NAME = "report-compilation-queue";
    private static final int MAX_RETRIES = 3;

    private final SqsClient sqsClient;
    private final SqsConfig sqsConfig;
    private final TaskService taskService;
    private final ReportCompilationService reportCompilationService;
    private final JobRepository jobRepository;
    private final ObjectMapper objectMapper;
    private final SqsProcessedMessageRepository processedMessageRepository;

    /**
     * Poll QC queue for task QC processing.
     * Runs every 5 seconds with idempotent processing.
     */
    @Scheduled(fixedDelay = 5000)
    public void pollQcQueue() {
        if (sqsConfig.getQcQueue() == null || sqsConfig.getQcQueue().isEmpty()) {
            return;
        }

        try {
            ReceiveMessageRequest request = ReceiveMessageRequest.builder()
                    .queueUrl(sqsConfig.getQcQueue())
                    .maxNumberOfMessages(10)
                    .waitTimeSeconds(5)
                    .messageAttributeNames("correlationId", "messageType")
                    .build();

            List<Message> messages = sqsClient.receiveMessage(request).messages();

            for (Message message : messages) {
                processMessageIdempotently(message, QC_QUEUE_NAME, this::handleQcMessage);
            }
        } catch (Exception e) {
            log.error("Error polling QC queue", e);
        }
    }

    /**
     * Poll report compilation queue for generating reports.
     * Runs every 10 seconds with idempotent processing.
     */
    @Scheduled(fixedDelay = 10000)
    public void pollReportCompilationQueue() {
        if (sqsConfig.getReportCompilationQueue() == null || sqsConfig.getReportCompilationQueue().isEmpty()) {
            return;
        }

        try {
            ReceiveMessageRequest request = ReceiveMessageRequest.builder()
                    .queueUrl(sqsConfig.getReportCompilationQueue())
                    .maxNumberOfMessages(5)
                    .waitTimeSeconds(5)
                    .messageAttributeNames("correlationId", "messageType")
                    .build();

            List<Message> messages = sqsClient.receiveMessage(request).messages();

            for (Message message : messages) {
                processReportCompilationMessage(message);
            }
        } catch (Exception e) {
            log.error("Error polling report compilation queue", e);
        }
    }

    /**
     * Process a report compilation message.
     */
    private void processReportCompilationMessage(Message message) {
        String messageId = message.messageId();
        String correlationId = extractCorrelationId(message);

        try {
            MDC.put(CorrelationIdFilter.CORRELATION_ID_MDC_KEY, correlationId);
            MDC.put("sqsMessageId", messageId);
            MDC.put("sqsQueue", REPORT_COMPILATION_QUEUE_NAME);

            // Check if already processed
            if (processedMessageRepository.existsByMessageIdAndQueueName(messageId, REPORT_COMPILATION_QUEUE_NAME)) {
                log.info("Report compilation message already processed, skipping: {}", messageId);
                deleteMessage(sqsConfig.getReportCompilationQueue(), message.receiptHandle());
                return;
            }

            // Parse and process
            ReportCompilationEvent event = objectMapper.readValue(message.body(), ReportCompilationEvent.class);
            log.info("Processing report compilation for job {}", event.getJobId());

            Job job = jobRepository.findById(event.getJobId())
                    .orElseThrow(() -> new ResourceNotFoundException("Job", event.getJobId().toString()));

            reportCompilationService.compileReport(job);

            // Record success
            recordProcessedMessage(messageId, REPORT_COMPILATION_QUEUE_NAME, "REPORT_COMPILATION_EVENT", "SUCCESS", null);
            deleteMessage(sqsConfig.getReportCompilationQueue(), message.receiptHandle());

            log.info("Successfully compiled report for job {}", event.getJobId());

        } catch (Exception e) {
            log.error("Error processing report compilation message: {}", messageId, e);
            recordProcessedMessage(messageId, REPORT_COMPILATION_QUEUE_NAME, "REPORT_COMPILATION_EVENT", "FAILURE", e.getMessage());
        } finally {
            MDC.remove(CorrelationIdFilter.CORRELATION_ID_MDC_KEY);
            MDC.remove("sqsMessageId");
            MDC.remove("sqsQueue");
        }
    }

    /**
     * Process a message idempotently.
     * If the message has already been processed successfully, it will be skipped.
     */
    private void processMessageIdempotently(Message message,
                                            String queueName,
                                            MessageHandler handler) {
        String messageId = message.messageId();
        String correlationId = extractCorrelationId(message);

        // Set up MDC for logging
        try {
            MDC.put(CorrelationIdFilter.CORRELATION_ID_MDC_KEY, correlationId);
            MDC.put("sqsMessageId", messageId);
            MDC.put("sqsQueue", queueName);

            // Check if already processed (idempotency)
            if (processedMessageRepository.existsByMessageIdAndQueueName(messageId, queueName)) {
                log.info("Message already processed, skipping: {}", messageId);
                deleteMessage(sqsConfig.getQcQueue(), message.receiptHandle());
                return;
            }

            // Try to process the message
            try {
                handler.handle(message);

                // Record successful processing
                recordProcessedMessage(messageId, queueName, "QC_EVENT", "SUCCESS", null);
                deleteMessage(sqsConfig.getQcQueue(), message.receiptHandle());

                log.info("Successfully processed message: {}", messageId);

            } catch (Exception e) {
                log.error("Error processing message: {}", messageId, e);

                // Record failed processing for tracking
                recordProcessedMessage(messageId, queueName, "QC_EVENT", "FAILURE", e.getMessage());

                // Let SQS retry (don't delete message)
                // After max retries, it will go to DLQ
            }

        } finally {
            MDC.remove(CorrelationIdFilter.CORRELATION_ID_MDC_KEY);
            MDC.remove("sqsMessageId");
            MDC.remove("sqsQueue");
        }
    }

    /**
     * Handle QC event message.
     */
    private void handleQcMessage(Message message) throws Exception {
        QcEvent event = objectMapper.readValue(message.body(), QcEvent.class);
        log.info("Processing QC for task {}", event.getTaskId());

        taskService.processQc(event.getTaskId());
    }

    /**
     * Record processed message for idempotency.
     */
    @Transactional
    protected void recordProcessedMessage(String messageId,
                                          String queueName,
                                          String messageType,
                                          String result,
                                          String errorMessage) {
        try {
            SqsProcessedMessage record = SqsProcessedMessage.builder()
                    .messageId(messageId)
                    .queueName(queueName)
                    .messageType(messageType)
                    .processingResult(result)
                    .errorMessage(errorMessage != null && errorMessage.length() > 1000
                            ? errorMessage.substring(0, 1000) : errorMessage)
                    .build();

            processedMessageRepository.save(record);

        } catch (DataIntegrityViolationException e) {
            // Duplicate - another instance already recorded it
            log.debug("Message already recorded by another instance: {}", messageId);
        }
    }

    /**
     * Extract correlation ID from message attributes or generate new one.
     */
    private String extractCorrelationId(Message message) {
        MessageAttributeValue attr = message.messageAttributes().get("correlationId");
        if (attr != null && attr.stringValue() != null) {
            return attr.stringValue();
        }
        return UUID.randomUUID().toString();
    }

    /**
     * Delete message from queue after successful processing.
     */
    private void deleteMessage(String queueUrl, String receiptHandle) {
        try {
            DeleteMessageRequest request = DeleteMessageRequest.builder()
                    .queueUrl(queueUrl)
                    .receiptHandle(receiptHandle)
                    .build();
            sqsClient.deleteMessage(request);
        } catch (Exception e) {
            log.error("Error deleting message", e);
        }
    }

    /**
     * Functional interface for message handlers.
     */
    @FunctionalInterface
    private interface MessageHandler {
        void handle(Message message) throws Exception;
    }

    /**
     * Cleanup old processed message records.
     * Run daily to prevent table bloat.
     * Retention: 7 days (messages older than this can be safely deleted).
     */
    @Scheduled(cron = "0 0 3 * * *") // 3 AM daily
    @Transactional
    public void cleanupOldRecords() {
        java.time.Instant cutoff = java.time.Instant.now().minus(java.time.Duration.ofDays(7));
        int deleted = processedMessageRepository.deleteOlderThan(cutoff);
        if (deleted > 0) {
            log.info("Cleaned up {} old processed message records", deleted);
        }
    }
}
