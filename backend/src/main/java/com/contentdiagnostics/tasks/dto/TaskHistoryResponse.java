package com.contentdiagnostics.tasks.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for task history.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskHistoryResponse {

    private List<TaskDto> tasks;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;

    private TaskStats stats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskStats {
        private int totalCompleted;
        private int approved;
        private int rejected;
        private double approvalRate;
    }
}
