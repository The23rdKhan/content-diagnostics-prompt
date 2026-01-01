"use client"

import { useApi } from "./use-api"
import type { KpiResponse, CapacityResponse } from "@/lib/types/api"

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
  const { data, loading, error, refetch } = useApi<CapacityResponse>(
    "/admin/capacity"
  )

  return {
    capacity: data,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch admin reviewers list.
 */
export function useAdminReviewers(page: number = 0, size: number = 50) {
  interface AdminReviewerDto {
    id: number
    name: string
    email: string
    language: string
    qualificationStatus: "pending" | "passed" | "failed"
    qualityScore: number
    completionRate: number
    strikes: number
    status: "active" | "disabled" | "warned"
    tasksCompleted: number
    approvalRate: number
    joinedAt: string
  }

  const { data, loading, error, refetch } = useApi<AdminReviewerDto[]>(
    `/admin/reviewers?page=${page}&size=${size}`
  )

  return {
    reviewers: data ?? [],
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch admin creators list.
 */
export function useAdminCreators(page: number = 0, size: number = 50) {
  interface AdminCreatorDto {
    id: number
    name: string
    email: string
    planTier: "basic" | "professional" | "enterprise"
    uploadsThisMonth: number
    slaIssues: number
    creditsIssued: number
    joinedAt: string
  }

  const { data, loading, error, refetch } = useApi<AdminCreatorDto[]>(
    `/admin/creators?page=${page}&size=${size}`
  )

  return {
    creators: data ?? [],
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch admin payouts list.
 */
export function useAdminPayouts(page: number = 0, size: number = 50) {
  interface PayoutDto {
    id: number
    reviewerId: number
    reviewerName: string
    amount: number
    tasksIncluded: number
    status: "PENDING" | "QC" | "READY" | "RELEASED"
    createdAt: string
    releasedAt?: string
  }

  const { data, loading, error, refetch } = useApi<PayoutDto[]>(
    `/admin/payouts?page=${page}&size=${size}`
  )

  return {
    payouts: data ?? [],
    loading,
    error,
    refetch,
  }
}
