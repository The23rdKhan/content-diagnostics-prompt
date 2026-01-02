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

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Poll for new notifications every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
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
