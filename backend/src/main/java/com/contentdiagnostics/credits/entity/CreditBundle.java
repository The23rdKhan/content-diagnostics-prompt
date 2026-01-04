package com.contentdiagnostics.credits.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Entity representing a purchasable credit bundle (pay-as-you-go).
 */
@Entity
@Table(name = "credit_bundles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditBundle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Unique bundle code: "starter", "creator", "pro", "studio"
     */
    @Column(name = "bundle_code", nullable = false, unique = true, length = 50)
    private String bundleCode;

    /**
     * Display name: "Starter Pack", "Creator Pack", etc.
     */
    @Column(nullable = false, length = 100)
    private String name;

    /**
     * Number of credits in this bundle
     */
    @Column(nullable = false)
    private Integer credits;

    /**
     * Bundle price
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    /**
     * Bundle description
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Price per individual credit
     */
    @Column(name = "price_per_credit", precision = 10, scale = 2)
    private BigDecimal pricePerCredit;

    /**
     * Savings percentage compared to base rate
     */
    @Column(name = "savings_percent")
    private Integer savingsPercent;

    /**
     * Whether this bundle should be highlighted as popular
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean popular = false;

    /**
     * Whether this bundle is currently active and available
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    /**
     * Display order in bundle listings
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
