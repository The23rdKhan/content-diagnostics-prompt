package com.contentdiagnostics.integration;

import com.contentdiagnostics.billing.entity.StripeEvent;
import com.contentdiagnostics.billing.repository.StripeEventRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Integration tests for Stripe webhook idempotency.
 *
 * Tests that duplicate webhook events are handled correctly and only processed once.
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class WebhookIdempotencyTest extends BaseIntegrationTest {

    @Autowired
    private StripeEventRepository stripeEventRepository;

    @BeforeEach
    void setUp() {
        stripeEventRepository.deleteAll();
    }

    @Test
    @Order(1)
    @DisplayName("Should store and retrieve Stripe event")
    void shouldStoreAndRetrieveStripeEvent() {
        String eventId = "evt_test_" + System.currentTimeMillis();

        StripeEvent event = StripeEvent.builder()
                .eventId(eventId)
                .eventType("checkout.session.completed")
                .payload("{\"test\": \"payload\"}")
                .processed(false)
                .build();

        StripeEvent saved = stripeEventRepository.save(event);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getEventId()).isEqualTo(eventId);
        assertThat(saved.getProcessed()).isFalse();
        assertThat(saved.getCreatedAt()).isNotNull();
    }

    @Test
    @Order(2)
    @DisplayName("Should detect duplicate event ID")
    void shouldDetectDuplicateEventId() {
        String eventId = "evt_duplicate_" + System.currentTimeMillis();

        StripeEvent event1 = StripeEvent.builder()
                .eventId(eventId)
                .eventType("checkout.session.completed")
                .payload("{\"first\": true}")
                .processed(true)
                .processedAt(Instant.now())
                .build();

        stripeEventRepository.save(event1);

        // existsByEventId should return true
        assertThat(stripeEventRepository.existsByEventId(eventId)).isTrue();

        // Trying to insert duplicate should fail
        StripeEvent event2 = StripeEvent.builder()
                .eventId(eventId)
                .eventType("checkout.session.completed")
                .payload("{\"second\": true}")
                .processed(false)
                .build();

        assertThatThrownBy(() -> stripeEventRepository.saveAndFlush(event2))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @Order(3)
    @DisplayName("Should allow different event IDs")
    void shouldAllowDifferentEventIds() {
        String baseId = "evt_unique_" + System.currentTimeMillis();

        StripeEvent event1 = StripeEvent.builder()
                .eventId(baseId + "_1")
                .eventType("checkout.session.completed")
                .payload("{}")
                .build();

        StripeEvent event2 = StripeEvent.builder()
                .eventId(baseId + "_2")
                .eventType("invoice.payment_succeeded")
                .payload("{}")
                .build();

        stripeEventRepository.save(event1);
        stripeEventRepository.save(event2);

        assertThat(stripeEventRepository.count()).isEqualTo(2);
    }

    @Test
    @Order(4)
    @DisplayName("Concurrent inserts of same event should result in only one success")
    void concurrentInsertsShouldResultInOneSuccess() throws Exception {
        String eventId = "evt_concurrent_" + System.currentTimeMillis();
        int numConcurrentAttempts = 10;

        ExecutorService executor = Executors.newFixedThreadPool(numConcurrentAttempts);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(numConcurrentAttempts);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);
        List<Exception> exceptions = new CopyOnWriteArrayList<>();

        for (int i = 0; i < numConcurrentAttempts; i++) {
            final int attempt = i;
            executor.submit(() -> {
                try {
                    startLatch.await();

                    // Simulate the idempotency check pattern used in StripeService
                    boolean alreadyExists = stripeEventRepository.existsByEventId(eventId);

                    if (!alreadyExists) {
                        try {
                            StripeEvent event = StripeEvent.builder()
                                    .eventId(eventId)
                                    .eventType("checkout.session.completed")
                                    .payload("{\"attempt\": " + attempt + "}")
                                    .processed(true)
                                    .processedAt(Instant.now())
                                    .build();
                            stripeEventRepository.saveAndFlush(event);
                            successCount.incrementAndGet();
                        } catch (DataIntegrityViolationException e) {
                            // Race condition - another thread inserted first
                            failureCount.incrementAndGet();
                        }
                    } else {
                        failureCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    exceptions.add(e);
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        // Start all threads simultaneously
        startLatch.countDown();

        // Wait for all threads to complete
        boolean completed = doneLatch.await(30, TimeUnit.SECONDS);
        assertThat(completed).isTrue();

        executor.shutdown();

        // Verify exactly one insert succeeded
        assertThat(successCount.get())
                .as("Exactly one insert should succeed")
                .isEqualTo(1);

        // Verify event exists in database
        assertThat(stripeEventRepository.existsByEventId(eventId)).isTrue();

        // Verify only one record exists
        assertThat(stripeEventRepository.count()).isEqualTo(1);
    }

    @Test
    @Order(5)
    @DisplayName("Should track processing status and errors")
    void shouldTrackProcessingStatusAndErrors() {
        String eventId = "evt_processing_" + System.currentTimeMillis();

        // Create event
        StripeEvent event = StripeEvent.builder()
                .eventId(eventId)
                .eventType("invoice.payment_failed")
                .payload("{\"invoice_id\": \"inv_123\"}")
                .processed(false)
                .build();

        event = stripeEventRepository.save(event);
        Long eventDbId = event.getId();

        // Simulate processing failure
        event.setProcessingError("Failed to update subscription: Database error");
        stripeEventRepository.save(event);

        // Retrieve and verify
        StripeEvent retrieved = stripeEventRepository.findById(eventDbId).orElseThrow();
        assertThat(retrieved.getProcessed()).isFalse();
        assertThat(retrieved.getProcessingError()).contains("Database error");

        // Simulate retry and success
        retrieved.setProcessed(true);
        retrieved.setProcessedAt(Instant.now());
        retrieved.setProcessingError(null);
        stripeEventRepository.save(retrieved);

        // Verify final state
        StripeEvent final_ = stripeEventRepository.findById(eventDbId).orElseThrow();
        assertThat(final_.getProcessed()).isTrue();
        assertThat(final_.getProcessedAt()).isNotNull();
        assertThat(final_.getProcessingError()).isNull();
    }

    @Test
    @Order(6)
    @DisplayName("Should enforce event_id uniqueness constraint")
    @Transactional
    void shouldEnforceEventIdUniquenessConstraint() {
        String eventId = "evt_constraint_" + System.currentTimeMillis();

        StripeEvent event = StripeEvent.builder()
                .eventId(eventId)
                .eventType("customer.subscription.created")
                .payload("{}")
                .build();

        stripeEventRepository.save(event);

        // existsByEventId should work for the check-then-insert pattern
        assertThat(stripeEventRepository.existsByEventId(eventId)).isTrue();
        assertThat(stripeEventRepository.existsByEventId("nonexistent")).isFalse();
    }
}
