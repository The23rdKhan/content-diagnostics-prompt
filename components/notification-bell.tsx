"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useNotifications } from "@/lib/notification-context"
import { useAuth } from "@/lib/auth-context"
import { trackEvent } from "@/lib/analytics"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export function NotificationBell() {
  const { user } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead, getNotificationsByRole } = useNotifications()

  if (!user || user.role === "ADMIN") return null

  const roleNotifications = getNotificationsByRole(user.role)
  const recentNotifications = roleNotifications.slice(0, 5)
  const notificationsPath = user.role === "CREATOR" ? "/creators/notifications" : "/reviewers/notifications"

  const handleDropdownOpen = (open: boolean) => {
    if (open) {
      trackEvent("notification_dropdown_opened", { role: user.role })
    }
  }

  const handleNotificationClick = (id: string) => {
    markAsRead(id)
    trackEvent("notification_viewed", { notification_id: id })
  }

  return (
    <DropdownMenu onOpenChange={handleDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-1 text-xs" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {recentNotifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet</div>
        ) : (
          <>
            {recentNotifications.map((notification) => (
              <DropdownMenuItem key={notification.id} asChild className="cursor-pointer">
                <Link
                  href={notification.deepLink || notificationsPath}
                  className="flex flex-col gap-1 p-3"
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className={`text-sm ${!notification.read ? "font-semibold" : ""}`}>{notification.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                    </div>
                    {!notification.read && (
                      <div className="mt-1 h-2 w-2 rounded-full bg-accent flex-shrink-0" aria-label="Unread" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={notificationsPath} className="w-full text-center text-sm font-medium p-2">
                View all notifications
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
