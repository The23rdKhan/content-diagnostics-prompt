package com.contentdiagnostics.credits.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creator's credit balance information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditBalanceDto {

    private Integer balance;
    private Integer creditsPerVideo;
    private Integer videosAvailable;
    private Integer usedThisMonth;
    private Integer purchasedThisMonth;
}
