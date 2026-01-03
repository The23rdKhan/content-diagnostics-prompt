package com.contentdiagnostics.credits.entity;

import com.contentdiagnostics.creators.entity.CreatorProfile;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Entity tracking all credit transactions (purchases, usage, admin issuance, refunds).
 */
@Entity
@Table(name = "credit_transactions", indexes = {
        @Index(name = "idx_credit_tx_creator", columnList = "creator_id"),
        @Index(name = "idx_credit_tx_type", columnList = "transaction_type"),
        @Index(name = "idx_credit_tx_created", columnList = "created_at")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private CreatorProfile creator;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 30)
    private CreditTransactionType type;

    @Column(nullable = false)
    private Integer amount; // positive for credits added, negative for credits used

    @Column(name = "balance_after", nullable = false)
    private Integer balanceAfter;

    @Column(length = 255)
    private String description;

    // For PURCHASE transactions
    @Column(name = "stripe_payment_intent_id", length = 100)
    private String stripePaymentIntentId;

    @Column(name = "price_paid", precision = 10, scale = 2)
    private BigDecimal pricePaid;

    @Column(name = "bundle_id", length = 50)
    private String bundleId;

    // For USAGE transactions
    @Column(name = "job_id")
    private Long jobId;

    // For ADMIN_ISSUE transactions
    @Column(name = "admin_user_id")
    private Long adminUserId;

    @Column(length = 255)
    private String reason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
