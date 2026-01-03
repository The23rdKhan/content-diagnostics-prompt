package com.contentdiagnostics.credits.entity;

/**
 * Types of credit transactions.
 */
public enum CreditTransactionType {
    PURCHASE,       // Credits purchased via Stripe
    USAGE,          // Credits used for video submission
    ADMIN_ISSUE,    // Credits issued by admin (support, compensation)
    SUBSCRIPTION,   // Monthly credits from subscription
    REFUND,         // Credits refunded (cancelled job, issue)
    PROMO           // Promotional credits (sign-up bonus, campaign)
}
