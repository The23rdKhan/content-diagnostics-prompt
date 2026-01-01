package com.contentdiagnostics.tasks.dto;

import com.contentdiagnostics.tasks.entity.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * DTO for task responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDto {

    private Long id;
    private TaskStatus status;
    private String language;
    private String segmentTimestamp;
    private Integer segmentDurationSeconds;
    private Double payAmount;
    private String videoSegmentUrl;
    private List<TaskQuestion> questions;
    private Integer attentionCheckIndex;

    // Lease info
    private Instant leaseExpiresAt;

    // Submission info
    private Instant submittedAt;
    private Instant reviewedAt;
    private String rejectionReason;

    private Instant createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskQuestion {
        private String id;
        private String question;
        private String type; // "scale", "choice", "text", "attention-check"
        private List<String> options;
    }
}
