package com.contentdiagnostics.storage.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.common.exception.BadRequestException;
import com.contentdiagnostics.storage.dto.PresignRequest;
import com.contentdiagnostics.storage.dto.PresignResponse;
import com.contentdiagnostics.storage.dto.UploadType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Service for generating presigned S3 upload URLs.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StorageService {

    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${aws.s3.presign-expiration-minutes:60}")
    private int presignExpirationMinutes;

    @Value("${aws.region}")
    private String awsRegion;

    // Allowed content types per upload type
    private static final Map<UploadType, Set<String>> ALLOWED_CONTENT_TYPES = Map.of(
            UploadType.VIDEO, Set.of("video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"),
            UploadType.CREATOR_AVATAR, Set.of("image/jpeg", "image/png", "image/webp"),
            UploadType.CREATOR_BANNER, Set.of("image/jpeg", "image/png", "image/webp"),
            UploadType.REVIEWER_AVATAR, Set.of("image/jpeg", "image/png", "image/webp")
    );

    // Max file sizes in bytes
    private static final Map<UploadType, Long> MAX_FILE_SIZES = Map.of(
            UploadType.VIDEO, 5L * 1024 * 1024 * 1024, // 5GB
            UploadType.CREATOR_AVATAR, 10L * 1024 * 1024, // 10MB
            UploadType.CREATOR_BANNER, 20L * 1024 * 1024, // 20MB
            UploadType.REVIEWER_AVATAR, 10L * 1024 * 1024 // 10MB
    );

    /**
     * Generate a presigned URL for uploading a file.
     */
    public PresignResponse generatePresignedUrl(User user, PresignRequest request) {
        validateRequest(request);

        String key = generateStorageKey(user, request);
        String contentType = determineContentType(request);

        // Build the put object request
        PutObjectRequest.Builder objectRequestBuilder = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType);

        if (request.getContentLength() != null) {
            objectRequestBuilder.contentLength(request.getContentLength());
        }

        PutObjectRequest objectRequest = objectRequestBuilder.build();

        // Generate presigned URL
        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(presignExpirationMinutes))
                .putObjectRequest(objectRequest)
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);

        Instant expiresAt = Instant.now().plus(Duration.ofMinutes(presignExpirationMinutes));

        // Build required headers
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", contentType);

        log.info("Generated presigned URL for user {} type {} key {}", user.getId(), request.getType(), key);

        return PresignResponse.builder()
                .uploadUrl(presignedRequest.url().toString())
                .fileUrl(buildFileUrl(key))
                .key(key)
                .expiresAt(expiresAt)
                .requiredHeaders(headers)
                .build();
    }

    /**
     * Validate the presign request.
     */
    private void validateRequest(PresignRequest request) {
        // Validate content type if provided
        if (request.getContentType() != null) {
            Set<String> allowed = ALLOWED_CONTENT_TYPES.get(request.getType());
            if (!allowed.contains(request.getContentType().toLowerCase())) {
                throw new BadRequestException(
                        "Content type " + request.getContentType() + " not allowed for " + request.getType(),
                        "INVALID_CONTENT_TYPE");
            }
        }

        // Validate file size if provided
        if (request.getContentLength() != null) {
            Long maxSize = MAX_FILE_SIZES.get(request.getType());
            if (request.getContentLength() > maxSize) {
                throw new BadRequestException(
                        "File size exceeds maximum of " + (maxSize / 1024 / 1024) + "MB",
                        "FILE_TOO_LARGE");
            }
        }
    }

    /**
     * Generate storage key based on upload type and user.
     */
    private String generateStorageKey(User user, PresignRequest request) {
        String uuid = UUID.randomUUID().toString();
        String extension = getFileExtension(request.getFilename());

        return switch (request.getType()) {
            case VIDEO -> String.format("videos/user-%d/%s%s", user.getId(), uuid, extension);
            case CREATOR_AVATAR -> String.format("profiles/creators/%d/avatar%s", user.getId(), extension);
            case CREATOR_BANNER -> String.format("profiles/creators/%d/banner%s", user.getId(), extension);
            case REVIEWER_AVATAR -> String.format("profiles/reviewers/%d/avatar%s", user.getId(), extension);
        };
    }

    /**
     * Determine content type from request or filename.
     */
    private String determineContentType(PresignRequest request) {
        if (request.getContentType() != null) {
            return request.getContentType();
        }

        // Infer from filename extension
        String extension = getFileExtension(request.getFilename()).toLowerCase();
        return switch (extension) {
            case ".mp4" -> "video/mp4";
            case ".mov" -> "video/quicktime";
            case ".avi" -> "video/x-msvideo";
            case ".webm" -> "video/webm";
            case ".jpg", ".jpeg" -> "image/jpeg";
            case ".png" -> "image/png";
            case ".webp" -> "image/webp";
            default -> "application/octet-stream";
        };
    }

    /**
     * Get file extension from filename.
     */
    private String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        if (lastDot > 0) {
            return filename.substring(lastDot);
        }
        return "";
    }

    /**
     * Build the final accessible URL for the file.
     */
    private String buildFileUrl(String key) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, awsRegion, key);
    }
}
