package com.contentdiagnostics.notifications.entity;

import com.contentdiagnostics.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

/**
 * Entity for user email notification preferences.
 */
@Entity
@Table(name = "email_preferences")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // Creator email preferences
    @Column(nullable = false)
    @Builder.Default
    private Boolean reportReady = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean progressUpdates = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean billingAlerts = true;

    // Reviewer email preferences
    @Column(nullable = false)
    @Builder.Default
    private Boolean taskUpdates = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean payoutNotifications = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean policyUpdates = true;

    // Common
    @Column(nullable = false)
    @Builder.Default
    private Boolean marketingEmails = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;
}
