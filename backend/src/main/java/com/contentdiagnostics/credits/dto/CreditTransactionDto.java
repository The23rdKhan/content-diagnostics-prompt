package com.contentdiagnostics.credits.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO for credit transaction history.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditTransactionDto {

    private Long id;
    private String type;
    private Integer amount;
    private Integer balanceAfter;
    private String description;
    private Instant createdAt;
}
