package com.contentdiagnostics.storage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for generating presigned upload URLs.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresignRequest {

    @NotNull(message = "Upload type is required")
    private UploadType type;

    @NotBlank(message = "Filename is required")
    private String filename;

    private String contentType;

    private Long contentLength;
}
