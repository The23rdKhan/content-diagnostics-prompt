"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useNotifications, type CreatorNotificationType } from "@/lib/notification-context"
import { trackEvent } from "@/lib/analytics"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Bell, CheckCheck, Filter } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

const notificationTypeLabels: Record<CreatorNotificationType, string> = {
  upload_received: "Upload Received",
  processing_update: "Processing Update",
  ai_diagnostics_complete: "AI Diagnostics Complete",
  human_review_in_progress: "Human Review In Progress",
  report_ready: "Report Ready",
  subscription_billing: "Subscription/Billing",
  addon_confirmation: "Add-on Confirmation",
}

export default function CreatorNotificationsPage() {
  const { getNotificationsByRole, markAsRead, markAllAsRead } = useNotifications()
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all")
  const [selectedType, setSelectedType] = useState<CreatorNotificationType | "all">("all")

  const creatorNotifications = getNotificationsByRole("CREATOR")

  const filteredNotifications = creatorNotifications.filter((notification) => {
    const matchesTab = activeTab === "all" || !notification.read
    const matchesType = selectedType === "all" || notification.type === selectedType
    return matchesTab && matchesType
  })

  const handleNotificationClick = (id: string) => {
    markAsRead(id)
    trackEvent("notification_viewed", { notification_id: id })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/creators/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-accent" />
            <h1 className="text-2xl font-bold">Notifications</h1>
          </div>
          {filteredNotifications.some((n) => !n.read) && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "all"
                ? "border-b-2 border-accent text-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "unread"
                ? "border-b-2 border-accent text-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Unread ({creatorNotifications.filter((n) => !n.read).length})
          </button>
        </div>

        {/* Filters */}
        <Card className="mb-4 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by type:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("all")}
            >
              All Types
            </Button>
            {Object.entries(notificationTypeLabels).map(([type, label]) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type as CreatorNotificationType)}
              >
                {label}
              </Button>
            ))}
          </div>
        </Card>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 text-lg font-semibold">No notifications</h2>
            <p className="text-sm text-muted-foreground">
              {activeTab === "unread" ? "You're all caught up!" : "You haven't received any notifications yet."}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 transition-colors hover:bg-secondary/50 ${!notification.read ? "border-l-4 border-l-accent" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className={`text-sm ${!notification.read ? "font-semibold" : "font-medium"}`}>
                        {notification.title}
                      </h3>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                        {notificationTypeLabels[notification.type as CreatorNotificationType]}
                      </span>
                    </div>
                    <p className="mb-2 text-sm text-muted-foreground">{notification.message}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                      {notification.deepLink && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          asChild
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          <Link href={notification.deepLink}>View →</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="mt-1 h-2 w-2 rounded-full bg-accent flex-shrink-0" aria-label="Unread" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
