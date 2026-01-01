package com.contentdiagnostics.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response payload for requeue expired leases.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDebugRequeueResponse {

    private int requeuedCount;
}
