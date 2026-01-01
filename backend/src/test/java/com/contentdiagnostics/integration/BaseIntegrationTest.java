package com.contentdiagnostics.integration;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Base class for integration tests using Testcontainers.
 *
 * Provides:
 * - PostgreSQL container with Flyway migrations
 * - Spring Boot test context
 * - Common test utilities
 *
 * Usage:
 * Extend this class for integration tests that need a real database.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Testcontainers
public abstract class BaseIntegrationTest {

    /**
     * PostgreSQL container shared across all tests in the class.
     */
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test")
            .withReuse(true);

    /**
     * Configure Spring datasource to use the container.
     */
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);

        // Enable Flyway for integration tests
        registry.add("spring.flyway.enabled", () -> true);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");

        // Use test JWT secret
        registry.add("jwt.secret", () -> "test-secret-key-for-integration-tests-must-be-256-bits-long");

        // Disable external services
        registry.add("aws.sqs.qc-queue", () -> "");
        registry.add("stripe.secret-key", () -> "sk_test_dummy");
        registry.add("stripe.webhook-secret", () -> "whsec_test_dummy");
    }
}
