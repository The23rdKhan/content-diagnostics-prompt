package com.contentdiagnostics.auth.dto;

import com.contentdiagnostics.auth.entity.UserRole;
import com.contentdiagnostics.reviewers.entity.PayoutMethod;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for user signup.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignUpRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    private String password;

    @NotNull(message = "Role is required")
    private UserRole role;

    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name must not exceed 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name must not exceed 50 characters")
    private String lastName;

    // Optional phone number in E.164 format
    @Pattern(regexp = "^$|^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
    private String phoneNumber;

    @NotBlank(message = "Country is required")
    @Size(min = 2, max = 2, message = "Country must be ISO 3166-1 alpha-2 code")
    private String country;

    @NotBlank(message = "Timezone is required")
    private String timezone;

    @AssertTrue(message = "You must accept the Terms of Service")
    private boolean tosAccepted;

    @Builder.Default
    private boolean marketingConsent = false;

    // For REVIEWER role only - preferred payout method
    private PayoutMethod preferredPayoutMethod;

    // Optional fields for profile creation (legacy/additional)
    private String company;
    private String language;
    private String proficiency;

    /**
     * Get display name for backward compatibility.
     */
    public String getName() {
        if (lastName == null || lastName.isEmpty()) {
            return firstName;
        }
        return firstName + " " + lastName;
    }
}
