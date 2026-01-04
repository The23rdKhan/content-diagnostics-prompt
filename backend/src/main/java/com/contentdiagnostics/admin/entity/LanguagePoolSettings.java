package com.contentdiagnostics.admin.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

/**
 * Entity for storing language pool capacity settings.
 */
@Entity
@Table(name = "language_pool_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LanguagePoolSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Language code (e.g., "en", "es", "pt")
     */
    @Column(name = "language_code", nullable = false, unique = true, length = 10)
    private String languageCode;

    /**
     * Display name (e.g., "English (Global)")
     */
    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    /**
     * Current SLA target (e.g., "24h", "48h", "72h")
     */
    @Column(name = "current_sla", nullable = false, length = 10)
    @Builder.Default
    private String currentSla = "24h";

    /**
     * Maximum reviewers per video
     */
    @Column(name = "max_reviewers_per_video", nullable = false)
    @Builder.Default
    private Integer maxReviewersPerVideo = 5;

    /**
     * Whether checkout is enabled for this language pool
     */
    @Column(name = "checkout_enabled", nullable = false)
    @Builder.Default
    private Boolean checkoutEnabled = true;

    /**
     * Whether live add-on is enabled
     */
    @Column(name = "live_addon_enabled", nullable = false)
    @Builder.Default
    private Boolean liveAddonEnabled = true;

    /**
     * Whether this language pool is active
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
