package com.contentdiagnostics.addons.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Entity representing an available add-on product.
 */
@Entity
@Table(name = "addons")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Addon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "price_display")
    private String priceDisplay;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AddonCategory category;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    public enum AddonCategory {
        REVIEWERS,
        DELIVERY,
        ANALYSIS,
        LIVE
    }
}
