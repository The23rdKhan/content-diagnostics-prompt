package com.contentdiagnostics.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.sqs.SqsClient;

import java.net.URI;

/**
 * AWS SDK configuration.
 * Supports LocalStack for local development via S3_ENDPOINT env var.
 */
@Configuration
public class AwsConfig {

    @Value("${aws.region}")
    private String awsRegion;

    @Value("${S3_ENDPOINT:}")
    private String s3Endpoint;

    @Value("${AWS_ACCESS_KEY_ID:}")
    private String accessKeyId;

    @Value("${AWS_SECRET_ACCESS_KEY:}")
    private String secretAccessKey;

    @Bean
    public S3Client s3Client() {
        var builder = S3Client.builder()
                .region(Region.of(awsRegion));

        if (s3Endpoint != null && !s3Endpoint.isEmpty()) {
            builder.endpointOverride(URI.create(s3Endpoint))
                    .serviceConfiguration(S3Configuration.builder()
                            .pathStyleAccessEnabled(true)
                            .build())
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(accessKeyId, secretAccessKey)));
        }

        return builder.build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        var builder = S3Presigner.builder()
                .region(Region.of(awsRegion));

        if (s3Endpoint != null && !s3Endpoint.isEmpty()) {
            builder.endpointOverride(URI.create(s3Endpoint))
                    .serviceConfiguration(S3Configuration.builder()
                            .pathStyleAccessEnabled(true)
                            .build())
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(accessKeyId, secretAccessKey)));
        }

        return builder.build();
    }

    @Bean
    public SqsClient sqsClient() {
        var builder = SqsClient.builder()
                .region(Region.of(awsRegion));

        if (s3Endpoint != null && !s3Endpoint.isEmpty()) {
            // SQS uses same LocalStack endpoint
            builder.endpointOverride(URI.create(s3Endpoint))
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(accessKeyId, secretAccessKey)));
        }

        return builder.build();
    }
}
