"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"
import { api } from "@/lib/api"
import type {
  KpiResponse,
  CapacityResponse,
  LanguagePoolCapacity,
  AdminDebugSampleResponse,
  AdminDebugCompileResponse,
  AdminDebugRequeueResponse,
} from "@/lib/types/api"

// =============================================================================
// Admin Types
// =============================================================================

export interface AdminTaskDto {
  id: number
  videoId: string
  segmentTimestamp: string
  language: string
  pay: number
  status: "pending" | "leased" | "submitted" | "approved" | "rejected" | "requeued"
  leaseExpiry?: string
  reviewerId?: string
  createdAt: string
}

export interface AdminReviewerDto {
  id: number
  name: string
  email: string
  languages: string[]
  qualificationStatus: "pending" | "passed" | "failed"
  qualityScore: number
  completionRate: number
  strikes: number
  status: "active" | "disabled" | "warned"
  tasksCompleted: number
  approvalRate: number
  joinedAt: string
}

export interface AdminCreatorDto {
  id: number
  name: string
  email: string
  planTier: "basic" | "professional" | "enterprise"
  uploadsThisMonth: number
  slaIssues: number
  creditsIssued: number
  joinedAt: string
}

export interface AdminPayoutDto {
  id: number
  reviewerId: number
  reviewerName: string
  amount: number
  tasksIncluded: number
  holdStatus: "pending" | "qc" | "ready" | "released"
  createdAt: string
  releasedAt?: string
}

export interface AdminStatsResponse {
  totalReviewers: number
  activeToday: number
  avgQualityScore: number
  fraudDetections: number
}

export interface CreatorStatsResponse {
  totalCreators: number
  activeThisMonth: number
  totalUploads: number
  creditsIssued: number
}

export interface PayoutStatsResponse {
  totalPending: number
  pendingCount: number
  releasedThisWeek: number
  releasedCount: number
  disputeCount: number
}

// =============================================================================
// KPI and Capacity Hooks
// =============================================================================

/**
 * Hook to fetch admin KPIs.
 */
export function useAdminKpis() {
  const { data, loading, error, refetch } = useApi<KpiResponse>("/admin/kpis")

  return {
    kpis: data,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch capacity data by language pool.
 */
export function useAdminCapacity() {
  const { data, loading, error, refetch } = useApi<CapacityResponse>("/admin/capacity")

  return {
    capacity: data,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to update a language pool's capacity settings.
 */
export function useUpdateCapacity() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateCapacity = useCallback(async (poolId: number, updates: Partial<LanguagePoolCapacity>): Promise<LanguagePoolCapacity> => {
    setLoading(true)
    setError(null)

    try {
      const result = await api.put<LanguagePoolCapacity>(`/admin/capacity/${poolId}`, updates)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to update capacity")
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return { updateCapacity, loading, error }
}

// =============================================================================
// Task Hooks
// =============================================================================

/**
 * Hook to fetch admin tasks with optional status filter.
 */
export function useAdminTasks(status?: string) {
  const path = status && status !== "all"
    ? `/admin/tasks?status=${status}`
    : "/admin/tasks"

  const { data, loading, error, refetch } = useApi<AdminTaskDto[]>(path)

  return {
    tasks: data ?? [],
    loading,
    error,
    refetch,
  }
}

export type BulkTaskAction = "approve" | "reject" | "requeue" | "increase_pay" | "pause"

/**
 * Hook for bulk task actions.
 */
export function useBulkTaskAction() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const executeBulkAction = useCallback(async (
    taskIds: number[],
    action: BulkTaskAction,
    params?: { payIncrease?: number }
  ): Promise<{ updated: number }> => {
    setLoading(true)
    setError(null)

    try {
      const result = await api.post<{ updated: number }>("/admin/tasks/bulk", {
        taskIds,
        action,
        ...params,
      })
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Bulk action failed")
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return { executeBulkAction, loading, error }
}

// =============================================================================
// Reviewer Hooks
// =============================================================================

/**
 * Hook to fetch admin reviewers list with optional search.
 */
export function useAdminReviewers(search?: string) {
  const path = search
    ? `/admin/reviewers?search=${encodeURIComponent(search)}`
    : "/admin/reviewers"

  const { data, loading, error, refetch } = useApi<AdminReviewerDto[]>(path)

  return {
    reviewers: data ?? [],
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch reviewer stats.
 */
export function useAdminReviewerStats() {
  const { data, loading, error, refetch } = useApi<AdminStatsResponse>("/admin/reviewers/stats")

  return {
    stats: data,
    loading,
    error,
    refetch,
  }
}

// =============================================================================
// Payout Hooks
// =============================================================================

/**
 * Hook to fetch admin payouts list with optional status filter.
 */
export function useAdminPayouts(status?: string) {
  const path = status && status !== "all"
    ? `/admin/payouts?status=${status}`
    : "/admin/payouts"

  const { data, loading, error, refetch } = useApi<AdminPayoutDto[]>(path)

  return {
    payouts: data ?? [],
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch payout stats.
 */
export function useAdminPayoutStats() {
  const { data, loading, error, refetch } = useApi<PayoutStatsResponse>("/admin/payouts/stats")

  return {
    stats: data,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to release a payout.
 */
export function useReleasePayout() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const releasePayout = useCallback(async (payoutId: number): Promise<AdminPayoutDto> => {
    setLoading(true)
    setError(null)

    try {
      const result = await api.post<AdminPayoutDto>(`/admin/payouts/${payoutId}/release`)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to release payout")
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return { releasePayout, loading, error }
}

// =============================================================================
// Creator Hooks
// =============================================================================

/**
 * Hook to fetch admin creators list with optional search.
 */
export function useAdminCreators(search?: string) {
  const path = search
    ? `/admin/creators?search=${encodeURIComponent(search)}`
    : "/admin/creators"

  const { data, loading, error, refetch } = useApi<AdminCreatorDto[]>(path)

  return {
    creators: data ?? [],
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch creator stats.
 */
export function useAdminCreatorStats() {
  const { data, loading, error, refetch } = useApi<CreatorStatsResponse>("/admin/creators/stats")

  return {
    stats: data,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to grant credit to a creator.
 */
export function useGrantCredit() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const grantCredit = useCallback(async (
    creatorId: number,
    amount: number,
    reason?: string
  ): Promise<{ newBalance: number }> => {
    setLoading(true)
    setError(null)

    try {
      const result = await api.post<{ newBalance: number }>(`/admin/creators/${creatorId}/credit`, {
        amount,
        reason,
      })
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to grant credit")
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return { grantCredit, loading, error }
}

// =============================================================================
// Debug Tools (staging-only)
// =============================================================================

export function useAdminDebugTools() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createSampleData = useCallback(async (): Promise<AdminDebugSampleResponse> => {
    setLoading(true)
    setError(null)

    try {
      return await api.post<AdminDebugSampleResponse>("/admin/debug/sample-data")
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create sample data")
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const triggerReportCompilation = useCallback(async (jobId?: number): Promise<AdminDebugCompileResponse> => {
    setLoading(true)
    setError(null)

    try {
      return await api.post<AdminDebugCompileResponse>("/admin/debug/compile-report", jobId ? { jobId } : undefined)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to compile report")
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const requeueExpiredLeases = useCallback(async (): Promise<AdminDebugRequeueResponse> => {
    setLoading(true)
    setError(null)

    try {
      return await api.post<AdminDebugRequeueResponse>("/admin/debug/requeue-expired")
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to requeue leases")
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    createSampleData,
    triggerReportCompilation,
    requeueExpiredLeases,
    loading,
    error,
  }
}
