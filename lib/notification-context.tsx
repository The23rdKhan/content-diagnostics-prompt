"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { api } from "./api"
import { trackEvent } from "./analytics"

export type NotificationRole = "CREATOR" | "REVIEWER"

export type CreatorNotificationType =
  | "upload_received"
  | "processing_update"
  | "ai_diagnostics_complete"
  | "human_review_in_progress"
  | "report_ready"
  | "subscription_billing"
  | "addon_confirmation"

export type ReviewerNotificationType =
  | "qualification_passed"
  | "qualification_failed"
  | "task_accepted"
  | "task_submitted"
  | "task_approved"
  | "task_rejected"
  | "payout_pending"
  | "payout_released"
  | "policy_update"

export type NotificationType = CreatorNotificationType | ReviewerNotificationType

export interface Notification {
  id: string
  role: NotificationRole
  type: NotificationType
  title: string
  message: string
  createdAt: string
  read: boolean
  deepLink?: string
}

interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: Error | null
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  getNotificationsByRole: (role: NotificationRole) => Notification[]
  refetch: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider")
  }
  return context
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n) => !n.read).length : 0

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.get<Notification[]>("/notifications")
      setNotifications(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch notifications"))
    } finally {
      setLoading(false)
    }
  }, [])

  // Polling with idle detection and tab visibility
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    let idleTimeout: NodeJS.Timeout | null = null
    const POLL_INTERVAL = 60000 // 60 seconds
    const IDLE_THRESHOLD = 5 * 60 * 1000 // 5 minutes of inactivity

    const startPolling = () => {
      if (!interval) {
        interval = setInterval(fetchNotifications, POLL_INTERVAL)
      }
    }

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
    }

    const resetIdleTimer = () => {
      if (idleTimeout) clearTimeout(idleTimeout)
      idleTimeout = setTimeout(stopPolling, IDLE_THRESHOLD)
      startPolling()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling()
        if (idleTimeout) clearTimeout(idleTimeout)
      } else {
        fetchNotifications() // Fetch immediately when tab becomes visible
        resetIdleTimer()
      }
    }

    // Initial fetch
    fetchNotifications()

    // Start polling and set up listeners
    startPolling()
    resetIdleTimer()
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("mousemove", resetIdleTimer)
    window.addEventListener("keydown", resetIdleTimer)
    window.addEventListener("click", resetIdleTimer)
    window.addEventListener("scroll", resetIdleTimer)

    return () => {
      stopPolling()
      if (idleTimeout) clearTimeout(idleTimeout)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("mousemove", resetIdleTimer)
      window.removeEventListener("keydown", resetIdleTimer)
      window.removeEventListener("click", resetIdleTimer)
      window.removeEventListener("scroll", resetIdleTimer)
    }
  }, [fetchNotifications])

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))

    try {
      await api.post("/notifications/mark-read", { notificationId: id })
      trackEvent("notification_mark_read", { notification_id: id })
    } catch (err) {
      // Revert on error
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)))
      throw err
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    const previousState = notifications

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))

    try {
      await api.post("/notifications/mark-all-read")
      trackEvent("notification_mark_all_read", {})
    } catch (err) {
      // Revert on error
      setNotifications(previousState)
      throw err
    }
  }, [notifications])

  const getNotificationsByRole = useCallback((role: NotificationRole) => {
    return notifications.filter((n) => n.role === role)
  }, [notifications])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        getNotificationsByRole,
        refetch: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
