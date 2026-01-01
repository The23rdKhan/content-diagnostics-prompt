package com.contentdiagnostics.notifications.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for email preferences.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailPreferenceDto {

    // Creator preferences
    private Boolean reportReady;
    private Boolean progressUpdates;
    private Boolean billingAlerts;

    // Reviewer preferences
    private Boolean taskUpdates;
    private Boolean payoutNotifications;
    private Boolean policyUpdates;

    // Common
    private Boolean marketingEmails;
}
