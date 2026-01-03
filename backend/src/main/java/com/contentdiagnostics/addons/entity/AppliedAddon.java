package com.contentdiagnostics.addons.entity;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.jobs.entity.Job;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Entity representing an add-on applied to a job.
 */
@Entity
@Table(name = "applied_addons")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppliedAddon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "addon_id", nullable = false)
    private Addon addon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AppliedAddonStatus status = AppliedAddonStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "applied_at", nullable = false, updatable = false)
    private Instant appliedAt;

    public enum AppliedAddonStatus {
        ACTIVE,
        COMPLETED,
        REFUNDED
    }
}
