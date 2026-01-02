"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"
import { api } from "@/lib/api"

// =============================================================================
// Types
// =============================================================================

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  reviewersPerVideo: number
  features: string[]
  interval: "MONTHLY" | "YEARLY"
}

export interface CurrentSubscription {
  id: string
  planId: string
  planName: string
  price: number
  reviewersPerVideo: number
  status: "ACTIVE" | "CANCELED" | "PAST_DUE" | "TRIALING"
  nextBillingDate: string
  videosThisMonth: number
  autoRenew: boolean
  features: string[]
}

export interface ChangePlanRequest {
  planId: string
}

// =============================================================================
// Hooks
// =============================================================================

/**
 * Hook to fetch the creator's current subscription.
 */
export function useCreatorSubscription() {
  const { data, loading, error, refetch } = useApi<CurrentSubscription>(
    "/creator/subscription"
  )

  return {
    subscription: data,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch available subscription plans.
 */
export function useAvailablePlans() {
  const { data, loading, error, refetch } = useApi<{ plans: SubscriptionPlan[] }>(
    "/creator/plans"
  )

  return {
    plans: data?.plans ?? [],
    loading,
    error,
    refetch,
  }
}

/**
 * Hook for changing subscription plans.
 */
export function useChangePlan() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const changePlan = useCallback(
    async (request: ChangePlanRequest): Promise<CurrentSubscription> => {
      setLoading(true)
      setError(null)

      try {
        const result = await api.post<CurrentSubscription>(
          "/creator/subscription/change",
          request
        )
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to change plan")
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const clearError = useCallback(() => setError(null), [])

  return {
    changePlan,
    loading,
    error,
    clearError,
  }
}

/**
 * Hook for canceling subscription.
 */
export function useCancelSubscription() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const cancelSubscription = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      await api.post("/creator/subscription/cancel", {})
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to cancel subscription")
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    cancelSubscription,
    loading,
    error,
  }
}
