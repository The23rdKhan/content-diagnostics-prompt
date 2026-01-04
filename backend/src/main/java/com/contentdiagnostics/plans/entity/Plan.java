package com.contentdiagnostics.plans.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Entity representing a subscription plan tier.
 * Consolidates all plan-related configuration in the database.
 */
@Entity
@Table(name = "plans")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Unique tier code: "basic", "professional", "enterprise"
     */
    @Column(name = "tier_code", nullable = false, unique = true, length = 50)
    private String tierCode;

    /**
     * Display name shown to users
     */
    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    /**
     * Plan description
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Monthly subscription price
     */
    @Column(name = "monthly_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal monthlyPrice;

    /**
     * Credits included per month
     */
    @Column(name = "credits_per_month", nullable = false)
    private Integer creditsPerMonth;

    /**
     * Number of reviewers per video
     */
    @Column(name = "reviewers_per_video", nullable = false)
    private Integer reviewersPerVideo;

    /**
     * Videos allowed per month (null = unlimited)
     */
    @Column(name = "videos_per_month")
    private Integer videosPerMonth;

    /**
     * SLA turnaround time in hours
     */
    @Column(name = "sla_hours")
    private Integer slaHours;

    /**
     * JSON array of feature descriptions
     */
    @Column(name = "features_json", columnDefinition = "TEXT")
    private String featuresJson;

    /**
     * Whether this plan is currently active and available
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    /**
     * Display order in plan listings
     */
    @Column(name = "sort_order")
    private Integer sortOrder;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
