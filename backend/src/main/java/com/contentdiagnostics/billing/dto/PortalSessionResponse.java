package com.contentdiagnostics.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for customer portal session.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortalSessionResponse {

    private String url;
}
