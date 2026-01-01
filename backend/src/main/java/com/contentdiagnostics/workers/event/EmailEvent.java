package com.contentdiagnostics.workers.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Event for sending emails via Resend.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailEvent {

    private Long userId;
    private String toEmail;
    private String templateId;
    private String subject;
    private Map<String, Object> templateData;
}
