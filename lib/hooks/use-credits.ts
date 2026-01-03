"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"
import { api } from "@/lib/api"

// =============================================================================
// Types
// =============================================================================

export interface CreditBalance {
  balance: number
  creditsPerVideo: number
  videosAvailable: number
  usedThisMonth: number
  purchasedThisMonth: number
}

export interface CreditBundle {
  id: string
  name: string
  credits: number
  price: number
  description: string
  popular: boolean
  pricePerCredit: number
  savingsPercent: number
}

export interface CreditTransaction {
  id: number
  type: "PURCHASE" | "USAGE" | "ADMIN_ISSUE" | "SUBSCRIPTION" | "REFUND" | "PROMO"
  amount: number
  balanceAfter: number
  description: string
  createdAt: string
}

interface TransactionsResponse {
  content: CreditTransaction[]
  totalPages: number
  totalElements: number
  number: number
  size: number
}

interface CheckoutResponse {
  sessionId: string
  url: string
}

// =============================================================================
// Hooks
// =============================================================================

/**
 * Hook to fetch credit balance.
 */
export function useCreditBalance() {
  const { data, loading, error, refetch } = useApi<CreditBalance>(
    "/creator/credits/balance"
  )

  return {
    balance: data?.balance ?? 0,
    creditsPerVideo: data?.creditsPerVideo ?? 5,
    videosAvailable: data?.videosAvailable ?? 0,
    usedThisMonth: data?.usedThisMonth ?? 0,
    purchasedThisMonth: data?.purchasedThisMonth ?? 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch available credit bundles.
 */
export function useCreditBundles() {
  const { data, loading, error, refetch } = useApi<CreditBundle[]>(
    "/creator/credits/bundles"
  )

  return {
    bundles: data ?? [],
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch credit transaction history.
 */
export function useCreditTransactions(page: number = 0, size: number = 10) {
  const { data, loading, error, refetch } = useApi<TransactionsResponse>(
    `/creator/credits/transactions?page=${page}&size=${size}`
  )

  return {
    transactions: data?.content ?? [],
    totalPages: data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook for purchasing credits.
 */
export function usePurchaseCredits() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const purchaseCredits = useCallback(
    async (bundleId: string, successUrl?: string, cancelUrl?: string): Promise<string> => {
      setLoading(true)
      setError(null)

      try {
        const result = await api.post<CheckoutResponse>("/creator/credits/purchase", {
          bundleId,
          successUrl: successUrl || `${window.location.origin}/creators/dashboard?credits_purchased=true`,
          cancelUrl: cancelUrl || `${window.location.origin}/creators/dashboard`,
        })

        // Redirect to Stripe checkout
        if (result.url) {
          window.location.href = result.url
        }

        return result.url
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to purchase credits")
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    purchaseCredits,
    loading,
    error,
  }
}

/**
 * Hook to check if user has enough credits for a video submission.
 */
export function useHasEnoughCredits(creditsRequired: number = 5) {
  const { balance, loading, error } = useCreditBalance()

  return {
    hasEnoughCredits: balance >= creditsRequired,
    balance,
    creditsRequired,
    creditsNeeded: Math.max(0, creditsRequired - balance),
    loading,
    error,
  }
}
