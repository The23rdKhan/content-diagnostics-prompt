package com.contentdiagnostics.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response payload for debug sample data creation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDebugSampleResponse {

    private Long jobId;
    private Long reportId;
    private List<Long> taskIds;
    private String creatorEmail;
    private String reviewerEmail;
}
