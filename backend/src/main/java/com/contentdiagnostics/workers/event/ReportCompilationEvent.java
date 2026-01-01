package com.contentdiagnostics.workers.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event for report compilation when all tasks are complete.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportCompilationEvent {

    private Long jobId;
    private Long reportId;
}
