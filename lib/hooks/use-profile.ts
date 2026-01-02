"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"
import { api } from "@/lib/api"
import type { CreatorProfile, ReviewerProfile } from "@/lib/types/api"

// =============================================================================
// Types
// =============================================================================

export interface UpdateCreatorProfileRequest {
  name?: string
  company?: string
  profileImageUrl?: string
  bannerImageUrl?: string
  primaryLanguage?: string
}

export interface UpdateReviewerProfileRequest {
  name?: string
  profileImageUrl?: string
  proficiency?: string
}

export interface UpdatePayoutMethodRequest {
  payoutMethod: "PAYPAL" | "BANK_TRANSFER" | "STRIPE_CONNECT"
  payoutDetails?: string
}

// =============================================================================
// Creator Profile Hook
// =============================================================================

/**
 * Hook to fetch and update creator profile.
 */
export function useCreatorProfile() {
  const { data, loading, error, refetch } = useApi<CreatorProfile>("/creator/profile")
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<Error | null>(null)

  const updateProfile = useCallback(
    async (updates: UpdateCreatorProfileRequest): Promise<CreatorProfile> => {
      setUpdating(true)
      setUpdateError(null)

      try {
        const result = await api.put<CreatorProfile>("/creator/profile", updates)
        // Refetch to ensure we have the latest data
        await refetch()
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to update profile")
        setUpdateError(error)
        throw error
      } finally {
        setUpdating(false)
      }
    },
    [refetch]
  )

  return {
    profile: data,
    loading,
    error,
    refetch,
    updateProfile,
    updating,
    updateError,
  }
}

// =============================================================================
// Reviewer Profile Hook
// =============================================================================

/**
 * Hook to fetch and update reviewer profile.
 */
export function useReviewerProfileWithUpdate() {
  const { data, loading, error, refetch } = useApi<ReviewerProfile>("/reviewer/profile")
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<Error | null>(null)

  const updateProfile = useCallback(
    async (updates: UpdateReviewerProfileRequest): Promise<ReviewerProfile> => {
      setUpdating(true)
      setUpdateError(null)

      try {
        const result = await api.put<ReviewerProfile>("/reviewer/profile", updates)
        await refetch()
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to update profile")
        setUpdateError(error)
        throw error
      } finally {
        setUpdating(false)
      }
    },
    [refetch]
  )

  const updatePayoutMethod = useCallback(
    async (request: UpdatePayoutMethodRequest): Promise<ReviewerProfile> => {
      setUpdating(true)
      setUpdateError(null)

      try {
        const result = await api.put<ReviewerProfile>("/reviewer/payout-method", request)
        await refetch()
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to update payout method")
        setUpdateError(error)
        throw error
      } finally {
        setUpdating(false)
      }
    },
    [refetch]
  )

  return {
    profile: data,
    loading,
    error,
    refetch,
    updateProfile,
    updatePayoutMethod,
    updating,
    updateError,
  }
}
