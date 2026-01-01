"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
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
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  getNotificationsByRole: (role: NotificationRole) => Notification[]
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider")
  }
  return context
}

// Seeded mock notifications
const seedNotifications: Notification[] = [
  {
    id: "notif-1",
    role: "CREATOR",
    type: "report_ready",
    title: "Report Ready",
    message: "Your report for 'Company Culture Video' is ready to view.",
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    read: false,
    deepLink: "/creators/reports/job-7",
  },
  {
    id: "notif-2",
    role: "CREATOR",
    type: "human_review_in_progress",
    message: "'Product Launch Announcement' is being reviewed (22/30 complete).",
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    read: false,
    deepLink: "/creators/dashboard",
  },
  {
    id: "notif-3",
    role: "CREATOR",
    type: "ai_diagnostics_complete",
    title: "AI Diagnostics Complete",
    message: "AI analysis finished for 'Tutorial Episode 12'. Human review starting soon.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true,
    deepLink: "/creators/dashboard",
  },
  {
    id: "notif-4",
    role: "CREATOR",
    type: "addon_confirmation",
    title: "Add-on Confirmed",
    message: "Extra 10 reviewers added to 'Webinar Recording - Q4 Updates'.",
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    read: true,
    deepLink: "/creators/add-ons",
  },
  {
    id: "notif-5",
    role: "CREATOR",
    type: "subscription_billing",
    title: "Payment Received",
    message: "Your Pro Plan payment of $99.00 has been processed successfully.",
    createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    read: true,
    deepLink: "/creators/billing",
  },
  {
    id: "notif-6",
    role: "REVIEWER",
    type: "task_approved",
    title: "Task Approved",
    message: "Your review for task #task-6 has been approved. $0.28 added to your balance.",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    deepLink: "/reviewers/earnings",
  },
  {
    id: "notif-7",
    role: "REVIEWER",
    type: "payout_released",
    title: "Payout Released",
    message: "$42.30 has been sent to your PayPal account (ending in 4532).",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    read: false,
    deepLink: "/reviewers/settings/payout",
  },
  {
    id: "notif-8",
    role: "REVIEWER",
    type: "task_rejected",
    title: "Task Rejected",
    message: "Your review for task #task-7 did not meet quality standards. Review rejection reason.",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    read: true,
    deepLink: "/reviewers/dashboard?tab=history",
  },
  {
    id: "notif-9",
    role: "REVIEWER",
    type: "qualification_passed",
    title: "Qualification Passed!",
    message: "Congratulations! You can now access the task queue and start earning.",
    createdAt: new Date(Date.now() - 240 * 60 * 60 * 1000).toISOString(),
    read: true,
    deepLink: "/reviewers/dashboard",
  },
  {
    id: "notif-10",
    role: "REVIEWER",
    type: "policy_update",
    title: "Policy Update",
    message: "Updated reviewer guidelines are now available. Please review them in your next session.",
    createdAt: new Date(Date.now() - 168 * 60 * 60 * 1000).toISOString(),
    read: true,
    deepLink: "/reviewers/dashboard?tab=support",
  },
]

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(seedNotifications)

  const unreadCount = notifications.filter((n) => !n.read).length

  const addNotification = (notification: Omit<Notification, "id" | "createdAt" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    trackEvent("notification_mark_read", { notification_id: id })
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    trackEvent("notification_mark_all_read", {})
  }

  const getNotificationsByRole = (role: NotificationRole) => {
    return notifications.filter((n) => n.role === role)
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        getNotificationsByRole,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
