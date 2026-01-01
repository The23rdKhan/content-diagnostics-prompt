package com.contentdiagnostics.storage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

/**
 * Response DTO for presigned upload URL.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresignResponse {

    /**
     * The presigned URL to upload to.
     */
    private String uploadUrl;

    /**
     * The final URL where the file will be accessible (after upload).
     */
    private String fileUrl;

    /**
     * The storage key/path for the file.
     */
    private String key;

    /**
     * When the presigned URL expires.
     */
    private Instant expiresAt;

    /**
     * Required headers to include in the upload request.
     */
    private Map<String, String> requiredHeaders;
}
