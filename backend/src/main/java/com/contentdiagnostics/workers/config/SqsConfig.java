package com.contentdiagnostics.workers.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * SQS queue URL configuration.
 */
@Configuration
@ConfigurationProperties(prefix = "aws.sqs")
@Getter
@Setter
public class SqsConfig {

    private String videoProcessingQueue;
    private String segmentationQueue;
    private String qcQueue;
    private String reportCompilationQueue;
    private String notificationQueue;
    private String emailQueue;
}
