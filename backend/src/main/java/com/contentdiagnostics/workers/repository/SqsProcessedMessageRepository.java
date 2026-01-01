package com.contentdiagnostics.workers.repository;

import com.contentdiagnostics.workers.entity.SqsProcessedMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;

/**
 * Repository for SQS processed message tracking.
 */
@Repository
public interface SqsProcessedMessageRepository extends JpaRepository<SqsProcessedMessage, Long> {

    /**
     * Check if a message has already been processed.
     */
    boolean existsByMessageIdAndQueueName(String messageId, String queueName);

    /**
     * Clean up old processed messages (for maintenance).
     * Messages older than the retention period can be safely deleted.
     */
    @Modifying
    @Query("DELETE FROM SqsProcessedMessage m WHERE m.processedAt < :before")
    int deleteOlderThan(@Param("before") Instant before);

    /**
     * Count failed messages for a queue (for monitoring).
     */
    @Query("SELECT COUNT(m) FROM SqsProcessedMessage m " +
           "WHERE m.queueName = :queueName AND m.processingResult = 'FAILURE'")
    long countFailedByQueue(@Param("queueName") String queueName);
}
