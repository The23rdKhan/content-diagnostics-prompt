package com.contentdiagnostics.workers;

import com.contentdiagnostics.tasks.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Scheduled job to handle expired task leases.
 * Requeues tasks whose lease has expired.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LeaseExpirationJob {

    private final TaskRepository taskRepository;

    /**
     * Run every minute to check for expired leases.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void requeueExpiredLeases() {
        Instant now = Instant.now();

        int requeued = taskRepository.requeueExpiredLeases(now);

        if (requeued > 0) {
            log.info("Requeued {} expired task leases", requeued);

            // Make requeued tasks available again
            int available = taskRepository.makeRequeuedAvailable();
            log.info("Made {} tasks available", available);
        }
    }
}
