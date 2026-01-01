package com.contentdiagnostics.workers.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event for QC processing of submitted tasks.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QcEvent {

    private Long taskId;
    private Long jobId;
    private Long reviewerId;
}
