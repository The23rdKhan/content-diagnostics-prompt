package com.contentdiagnostics.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO for admin view of creators.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCreatorDto {

    private Long id;
    private String name;
    private String email;
    private String planTier;
    private Integer uploadsThisMonth;
    private Integer slaIssues;
    private Integer creditsIssued;
    private Instant joinedAt;
}
