package com.contentdiagnostics.workers.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/**
 * Entity for tracking processed SQS messages to ensure idempotency.
 *
 * Each message is uniquely identified by its message ID and queue name.
 * Processing is idempotent: if a message has already been processed successfully,
 * it will not be processed again.
 */
@Entity
@Table(name = "sqs_processed_messages",
       uniqueConstraints = @UniqueConstraint(
               name = "uq_sqs_message",
               columnNames = {"message_id", "queue_name"}
       ))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SqsProcessedMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * AWS SQS Message ID.
     */
    @Column(name = "message_id", nullable = false, length = 100)
    private String messageId;

    /**
     * Source queue name.
     */
    @Column(name = "queue_name", nullable = false, length = 100)
    private String queueName;

    /**
     * Type of message/event for debugging.
     */
    @Column(name = "message_type", length = 50)
    private String messageType;

    /**
     * When the message was processed.
     */
    @CreationTimestamp
    @Column(name = "processed_at", nullable = false)
    private Instant processedAt;

    /**
     * Result of processing (SUCCESS, FAILURE).
     */
    @Column(name = "processing_result", nullable = false, length = 20)
    @Builder.Default
    private String processingResult = "SUCCESS";

    /**
     * Error message if processing failed.
     */
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    /**
     * Number of retry attempts.
     */
    @Column(name = "retry_count", nullable = false)
    @Builder.Default
    private Integer retryCount = 0;
}
