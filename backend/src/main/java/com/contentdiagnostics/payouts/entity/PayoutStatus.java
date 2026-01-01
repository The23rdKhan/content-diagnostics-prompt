package com.contentdiagnostics.payouts.entity;

/**
 * Status of a payout.
 */
public enum PayoutStatus {
    /**
     * Payout created, pending QC verification.
     */
    PENDING,

    /**
     * Tasks being QC verified.
     */
    QC,

    /**
     * Ready for release.
     */
    READY,

    /**
     * Payout released to reviewer.
     */
    RELEASED
}
