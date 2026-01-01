package com.contentdiagnostics.tasks.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Request DTO for submitting a completed task.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskSubmissionRequest {

    @NotNull(message = "Answers are required")
    private Map<String, Object> answers;

    @NotNull(message = "Watch ratio is required")
    private Double watchRatio;

    @NotNull(message = "Completion time is required")
    private Integer completionTimeSeconds;
}
