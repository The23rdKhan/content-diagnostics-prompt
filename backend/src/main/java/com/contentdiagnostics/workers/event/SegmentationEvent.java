package com.contentdiagnostics.workers.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Event for video segmentation results.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SegmentationEvent {

    private Long videoId;
    private Long jobId;
    private Integer totalSegments;
    private List<Segment> segments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Segment {
        private Integer index;
        private Integer startSeconds;
        private Integer endSeconds;
        private String segmentUrl;
    }
}
