package com.contentdiagnostics.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response payload for debug report compilation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDebugCompileResponse {

    private Long jobId;
    private Long reportId;
    private String status;
}
