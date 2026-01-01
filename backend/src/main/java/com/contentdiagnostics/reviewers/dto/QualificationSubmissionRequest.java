package com.contentdiagnostics.reviewers.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Request DTO for qualification test submission.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QualificationSubmissionRequest {

    @NotNull(message = "Answers are required")
    private Map<String, String> answers;

    private Double completionTimeSeconds;
}
