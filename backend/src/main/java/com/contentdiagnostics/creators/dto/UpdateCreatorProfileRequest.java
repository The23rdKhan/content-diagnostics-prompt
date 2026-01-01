package com.contentdiagnostics.creators.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating creator profile.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCreatorProfileRequest {

    @Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
    private String name;

    @Size(max = 100, message = "Company name must not exceed 100 characters")
    private String company;

    @Size(max = 512, message = "Profile image URL must not exceed 512 characters")
    private String profileImageUrl;

    @Size(max = 512, message = "Banner image URL must not exceed 512 characters")
    private String bannerImageUrl;

    @Size(max = 50, message = "Primary language must not exceed 50 characters")
    private String primaryLanguage;
}
