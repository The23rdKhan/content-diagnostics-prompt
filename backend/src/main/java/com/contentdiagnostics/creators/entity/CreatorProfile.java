package com.contentdiagnostics.creators.entity;

import com.contentdiagnostics.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

/**
 * Profile entity for content creators.
 */
@Entity
@Table(name = "creator_profiles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 100)
    private String name; // Legacy field, kept for backward compatibility

    @Column(nullable = false, length = 50)
    private String firstName;

    @Column(nullable = false, length = 50)
    private String lastName;

    @Column(length = 100)
    private String company;

    @Column(length = 512)
    private String profileImageUrl;

    @Column(length = 512)
    private String bannerImageUrl;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String primaryLanguage = "English";

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String planTier = "basic"; // basic, professional, enterprise

    @Column(nullable = false)
    @Builder.Default
    private Integer remainingCredits = 0;

    @Column(length = 100)
    private String stripeCustomerId;

    @Column(length = 100)
    private String stripeSubscriptionId;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    /**
     * Get the display name combining firstName and lastName.
     */
    public String getDisplayName() {
        if (lastName == null || lastName.isEmpty()) {
            return firstName;
        }
        return firstName + " " + lastName;
    }
}
