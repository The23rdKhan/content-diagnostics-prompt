"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"
import { api } from "@/lib/api"

// =============================================================================
// Types
// =============================================================================

export interface Addon {
  id: string
  name: string
  description: string
  price: number
  priceDisplay: string
  category: "REVIEWERS" | "DELIVERY" | "ANALYSIS" | "LIVE"
  icon?: string
}

export interface ActiveAddon {
  id: string
  addonId: string
  addonName: string
  jobId: number
  jobTitle?: string
  appliedDate: string
  status: "ACTIVE" | "COMPLETED" | "REFUNDED"
  price: number
}

export interface ApplyAddonRequest {
  addonId: string
  quantity?: number
}

// =============================================================================
// Hooks
// =============================================================================

/**
 * Hook to fetch available add-ons catalog.
 */
export function useAvailableAddons() {
  const { data, loading, error, refetch } = useApi<{ addons: Addon[] }>(
    "/creator/addons"
  )

  return {
    addons: data?.addons ?? [],
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch creator's active add-ons.
 */
export function useActiveAddons() {
  const { data, loading, error, refetch } = useApi<{ activeAddons: ActiveAddon[] }>(
    "/creator/addons/active"
  )

  return {
    activeAddons: data?.activeAddons ?? [],
    loading,
    error,
    refetch,
  }
}

/**
 * Hook for applying add-ons to a job.
 */
export function useApplyAddon() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const applyAddon = useCallback(
    async (jobId: number, request: ApplyAddonRequest): Promise<ActiveAddon> => {
      setLoading(true)
      setError(null)

      try {
        const result = await api.post<ActiveAddon>(
          `/creator/jobs/${jobId}/addons`,
          request
        )
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to apply add-on")
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
    applyAddon,
    loading,
    error,
    clearError,
  }
}
