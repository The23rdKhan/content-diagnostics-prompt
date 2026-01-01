package com.contentdiagnostics.videos.dto;

import com.contentdiagnostics.videos.entity.VideoStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO for video responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoDto {

    private Long id;
    private String title;
    private String fileName;
    private Long fileSize;
    private String storageUrl;
    private VideoStatus status;
    private String language;
    private Integer durationSeconds;
    private String resolution;
    private Instant createdAt;
}
