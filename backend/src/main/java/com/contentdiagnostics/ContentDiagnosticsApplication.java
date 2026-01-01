package com.contentdiagnostics;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main entry point for the Content Diagnostics API.
 *
 * This application provides backend services for content creators to submit
 * videos for review and receive diagnostic reports from both AI analysis
 * and human reviewers.
 */
@SpringBootApplication
@EnableScheduling
public class ContentDiagnosticsApplication {

    public static void main(String[] args) {
        SpringApplication.run(ContentDiagnosticsApplication.class, args);
    }
}
