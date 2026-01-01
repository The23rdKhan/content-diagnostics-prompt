package com.contentdiagnostics.workers.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event for video processing pipeline.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoProcessingEvent {

    private Long videoId;
    private Long jobId;
    private String storageKey;
    private String eventType; // "UPLOADED", "PROCESSING", "READY", "FAILED"
    private String metadata;
}
