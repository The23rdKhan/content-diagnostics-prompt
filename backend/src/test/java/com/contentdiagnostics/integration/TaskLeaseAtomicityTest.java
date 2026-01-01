package com.contentdiagnostics.integration;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.auth.entity.UserRole;
import com.contentdiagnostics.auth.repository.UserRepository;
import com.contentdiagnostics.jobs.entity.Job;
import com.contentdiagnostics.jobs.entity.JobStatus;
import com.contentdiagnostics.jobs.repository.JobRepository;
import com.contentdiagnostics.reviewers.entity.ReviewerProfile;
import com.contentdiagnostics.reviewers.repository.ReviewerProfileRepository;
import com.contentdiagnostics.tasks.entity.Task;
import com.contentdiagnostics.tasks.entity.TaskStatus;
import com.contentdiagnostics.tasks.repository.TaskRepository;
import com.contentdiagnostics.tasks.service.TaskService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for task leasing atomicity.
 *
 * Tests that concurrent lease attempts result in exactly one successful lease.
 * This is critical for preventing double-assignment of tasks to reviewers.
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class TaskLeaseAtomicityTest extends BaseIntegrationTest {

    @Autowired
    private TaskService taskService;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewerProfileRepository reviewerProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private List<User> testReviewers;
    private Task testTask;
    private Job testJob;

    @BeforeEach
    @Transactional
    void setUp() {
        // Create test reviewers
        testReviewers = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            User user = User.builder()
                    .email("reviewer-" + i + "-" + System.currentTimeMillis() + "@test.com")
                    .passwordHash(passwordEncoder.encode("password"))
                    .role(UserRole.REVIEWER)
                    .enabled(true)
                    .build();
            user = userRepository.save(user);

            ReviewerProfile profile = ReviewerProfile.builder()
                    .user(user)
                    .name("Reviewer " + i)
                    .language("English")
                    .qualificationPassed(true)
                    .queueLocked(false)
                    .qualityScore(100)
                    .build();
            reviewerProfileRepository.save(profile);

            testReviewers.add(user);
        }

        // Create a test job
        testJob = Job.builder()
                .title("Test Job")
                .language("English")
                .status(JobStatus.IN_REVIEW)
                .slaHours(48)
                .guaranteedReviewers(50)
                .build();
        testJob = jobRepository.save(testJob);

        // Create a test task
        testTask = Task.builder()
                .job(testJob)
                .segmentIndex(0)
                .segmentStart(0)
                .segmentEnd(60)
                .payAmount(0.30)
                .status(TaskStatus.AVAILABLE)
                .language("English")
                .build();
        testTask = taskRepository.save(testTask);
    }

    @Test
    @Order(1)
    @DisplayName("Concurrent lease attempts should result in exactly one successful lease")
    void concurrentLeaseAttemptsShouldResultInOneLease() throws Exception {
        int numConcurrentAttempts = 10;
        ExecutorService executor = Executors.newFixedThreadPool(numConcurrentAttempts);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(numConcurrentAttempts);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);
        List<Long> successfulUserIds = new CopyOnWriteArrayList<>();

        // Submit concurrent lease attempts
        for (int i = 0; i < numConcurrentAttempts; i++) {
            final User reviewer = testReviewers.get(i);
            executor.submit(() -> {
                try {
                    startLatch.await(); // Wait for all threads to be ready

                    try {
                        taskService.acceptTask(reviewer, testTask.getId());
                        successCount.incrementAndGet();
                        successfulUserIds.add(reviewer.getId());
                    } catch (Exception e) {
                        failureCount.incrementAndGet();
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
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

        // Verify exactly one lease succeeded
        assertThat(successCount.get())
                .as("Exactly one lease should succeed")
                .isEqualTo(1);

        assertThat(failureCount.get())
                .as("All other leases should fail")
                .isEqualTo(numConcurrentAttempts - 1);

        assertThat(successfulUserIds)
                .as("Exactly one user should have leased the task")
                .hasSize(1);

        // Verify task state in database
        Task leasedTask = taskRepository.findById(testTask.getId()).orElseThrow();
        assertThat(leasedTask.getStatus()).isEqualTo(TaskStatus.LEASED);
        assertThat(leasedTask.getReviewer()).isNotNull();
        assertThat(leasedTask.getReviewer().getUser().getId()).isEqualTo(successfulUserIds.get(0));
        assertThat(leasedTask.getLeaseExpiresAt()).isAfter(Instant.now());
    }

    @Test
    @Order(2)
    @DisplayName("Should not lease already leased task")
    void shouldNotLeaseAlreadyLeasedTask() throws Exception {
        // First, lease the task
        User firstReviewer = testReviewers.get(0);
        taskService.acceptTask(firstReviewer, testTask.getId());

        // Try to lease again with different reviewer
        User secondReviewer = testReviewers.get(1);

        try {
            taskService.acceptTask(secondReviewer, testTask.getId());
            Assertions.fail("Should have thrown exception");
        } catch (Exception e) {
            assertThat(e.getMessage()).contains("not available");
        }

        // Verify task is still assigned to first reviewer
        Task task = taskRepository.findById(testTask.getId()).orElseThrow();
        assertThat(task.getReviewer().getUser().getId()).isEqualTo(firstReviewer.getId());
    }

    @Test
    @Order(3)
    @DisplayName("Released task should be leasable again")
    void releasedTaskShouldBeLeasableAgain() throws Exception {
        // Lease the task
        User firstReviewer = testReviewers.get(0);
        taskService.acceptTask(firstReviewer, testTask.getId());

        // Release the task
        taskService.releaseTask(testTask.getId(), firstReviewer);

        // Verify task is available
        Task task = taskRepository.findById(testTask.getId()).orElseThrow();
        assertThat(task.getStatus()).isEqualTo(TaskStatus.AVAILABLE);
        assertThat(task.getReviewer()).isNull();

        // Lease with different reviewer should succeed
        User secondReviewer = testReviewers.get(1);
        taskService.acceptTask(secondReviewer, testTask.getId());

        task = taskRepository.findById(testTask.getId()).orElseThrow();
        assertThat(task.getStatus()).isEqualTo(TaskStatus.LEASED);
        assertThat(task.getReviewer().getUser().getId()).isEqualTo(secondReviewer.getId());
    }

    @Test
    @Order(4)
    @DisplayName("Lease expiration should make task available again")
    void leaseExpirationShouldMakeTaskAvailable() throws Exception {
        // Lease the task
        User reviewer = testReviewers.get(0);
        taskService.acceptTask(reviewer, testTask.getId());

        // Manually expire the lease (in production, this would be done by scheduled job)
        Task task = taskRepository.findById(testTask.getId()).orElseThrow();
        task.setLeaseExpiresAt(Instant.now().minusSeconds(60)); // Expired 1 minute ago
        taskRepository.save(task);

        // Requeue expired leases (simulating the scheduled job)
        taskRepository.requeueExpiredLeases(Instant.now());

        // Verify task is requeued (needs makeRequeuedAvailable to be AVAILABLE)
        task = taskRepository.findById(testTask.getId()).orElseThrow();
        assertThat(task.getStatus()).isEqualTo(TaskStatus.REQUEUED);
        assertThat(task.getReviewer()).isNull();

        // Make requeued tasks available
        taskRepository.makeRequeuedAvailable();

        task = taskRepository.findById(testTask.getId()).orElseThrow();
        assertThat(task.getStatus()).isEqualTo(TaskStatus.AVAILABLE);
    }
}
