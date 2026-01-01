"use client"

import { useApi, useApiMutation } from "./use-api"
import type { TaskDto, EarningsResponse, ReviewerProfile } from "@/lib/types/api"

/**
 * Hook to fetch reviewer's tasks.
 *
 * @param status - Filter by task status (default: "AVAILABLE")
 */
export function useReviewerTasks(status: string = "AVAILABLE") {
  const { data, loading, error, refetch } = useApi<TaskDto[]>(
    `/reviewer/tasks?status=${status}`
  )

  return {
    tasks: data ?? [],
    loading,
    error,
    refetch,
  }
}

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

/**
 * Hook to fetch reviewer's task history.
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

/**
 * Hook for task mutations (accept, submit).
 */
export function useTaskMutation() {
  const { mutate, loading, error } = useApiMutation<TaskDto>()

  return {
    acceptTask: (taskId: number) => mutate(`/reviewer/tasks/${taskId}/accept`),
    submitTask: (taskId: number, answers: Record<string, string>) =>
      mutate(`/reviewer/tasks/${taskId}/submit`, { answers }),
    loading,
    error,
  }
}
