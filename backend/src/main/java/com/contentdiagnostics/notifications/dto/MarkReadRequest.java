package com.contentdiagnostics.notifications.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO for marking notifications as read.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarkReadRequest {

    @NotEmpty(message = "Notification IDs are required")
    private List<Long> notificationIds;
}
