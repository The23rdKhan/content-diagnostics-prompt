package com.contentdiagnostics.payouts.entity;

import com.contentdiagnostics.reviewers.entity.ReviewerProfile;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/**
 * Entity representing a payout to a reviewer.
 */
@Entity
@Table(name = "payouts", indexes = {
        @Index(name = "idx_payouts_reviewer_id", columnList = "reviewer_id"),
        @Index(name = "idx_payouts_status", columnList = "status")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private ReviewerProfile reviewer;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private Integer tasksIncluded;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PayoutStatus status = PayoutStatus.PENDING;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column
    private Instant releasedAt;

    @Column(length = 255)
    private String transactionId;

    @Column(length = 500)
    private String notes;
}
