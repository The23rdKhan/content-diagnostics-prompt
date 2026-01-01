"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"
import { api, ApiRequestError, AuthenticationError } from "@/lib/api"
import type { TaskDto, TaskStatus, EarningsResponse, ReviewerProfile } from "@/lib/types/api"

// =============================================================================
// Task Fetching Hooks
// =============================================================================

/**
 * Hook to fetch reviewer's tasks.
 * @param status - Optional filter by task status
 */
export function useReviewerTasks(status?: TaskStatus) {
  const path = status ? `/reviewer/tasks?status=${status}` : "/reviewer/tasks"
  const { data, loading, error, refetch } = useApi<TaskDto[]>(path)

  return {
    tasks: data ?? [],
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch reviewer's task history with pagination.
 */
export function useReviewerTaskHistory(page: number = 0, size: number = 20) {
  interface TaskHistoryResponse {
    tasks: TaskDto[]
    page: number
    size: number
    totalElements: number
    totalPages: number
    stats: {
      totalCompleted: number
      approved: number
      rejected: number
      approvalRate: number
    }
  }

  const { data, loading, error, refetch } = useApi<TaskHistoryResponse>(
    `/reviewer/tasks/history?page=${page}&size=${size}`
  )

  return {
    history: data,
    loading,
    error,
    refetch,
  }
}

// =============================================================================
// Earnings Hook
// =============================================================================

/**
 * Hook to fetch reviewer's earnings.
 */
export function useReviewerEarnings() {
  const { data, loading, error, refetch } = useApi<EarningsResponse>(
    "/reviewer/earnings"
  )

  return {
    earnings: data,
    loading,
    error,
    refetch,
  }
}

// =============================================================================
// Profile Hook
// =============================================================================

/**
 * Hook to fetch reviewer's profile.
 */
export function useReviewerProfile() {
  const { data, loading, error, refetch } = useApi<ReviewerProfile>(
    "/reviewer/profile"
  )

  return {
    profile: data,
    loading,
    error,
    refetch,
  }
}

// =============================================================================
// Task Action Hooks
// =============================================================================

export interface TaskSubmitPayload {
  answers: Record<string, string>
  watchRatio: number
  attentionPassed: boolean
}

export interface TaskActionError {
  status: number
  message: string
}

/**
 * Hook for task mutations (accept, submit, release).
 */
export function useTaskActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<TaskActionError | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const acceptTask = useCallback(async (taskId: number): Promise<TaskDto> => {
    setLoading(true)
    setError(null)

    try {
      const result = await api.post<TaskDto>(`/reviewer/tasks/${taskId}/accept`)
      return result
    } catch (err: unknown) {
      const status = err instanceof ApiRequestError ? err.status ?? 500 : err instanceof AuthenticationError ? 401 : 500
      const message = status === 409
        ? "This task has already been accepted by another reviewer."
        : err instanceof Error
          ? err.message
          : "Failed to accept task"

      setError({ status, message })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const submitTask = useCallback(async (
    taskId: number,
    payload: TaskSubmitPayload
  ): Promise<TaskDto> => {
    setLoading(true)
    setError(null)

    try {
      const result = await api.post<TaskDto>(`/reviewer/tasks/${taskId}/submit`, payload)
      return result
    } catch (err: unknown) {
      const status = err instanceof ApiRequestError ? err.status ?? 500 : err instanceof AuthenticationError ? 401 : 500
      setError({
        status,
        message: err instanceof Error ? err.message : "Failed to submit task",
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const releaseTask = useCallback(async (taskId: number): Promise<TaskDto> => {
    setLoading(true)
    setError(null)

    try {
      const result = await api.post<TaskDto>(`/reviewer/tasks/${taskId}/release`)
      return result
    } catch (err: unknown) {
      const status = err instanceof ApiRequestError ? err.status ?? 500 : err instanceof AuthenticationError ? 401 : 500
      setError({
        status,
        message: err instanceof Error ? err.message : "Failed to release task",
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    acceptTask,
    submitTask,
    releaseTask,
    loading,
    error,
    clearError,
  }
}
