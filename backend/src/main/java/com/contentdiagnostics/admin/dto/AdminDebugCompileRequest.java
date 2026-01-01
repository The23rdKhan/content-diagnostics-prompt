package com.contentdiagnostics.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for debug report compilation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDebugCompileRequest {
    private Long jobId;
}
