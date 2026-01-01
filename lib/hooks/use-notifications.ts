"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"
import { api } from "@/lib/api"
import type { Notification } from "@/lib/notification-context"

/**
 * Hook to fetch notifications from the API.
 */
export function useNotificationsApi() {
  const { data, loading, error, refetch } = useApi<Notification[]>("/notifications")

  return {
    notifications: data ?? [],
    loading,
    error,
    refetch,
  }
}

/**
 * Hook for notification mutations (mark read, mark all read).
 */
export function useNotificationActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const markAsRead = useCallback(async (notificationId: string): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      await api.post("/notifications/mark-read", { notificationId })
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to mark as read"))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const markAllAsRead = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      await api.post("/notifications/mark-all-read")
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to mark all as read"))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    markAsRead,
    markAllAsRead,
    loading,
    error,
  }
}
