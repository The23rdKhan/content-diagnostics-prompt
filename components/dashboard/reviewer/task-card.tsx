"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Clock, Globe, DollarSign, Timer } from "lucide-react"
import type { ReviewTask } from "@/lib/task-data"

interface TaskCardProps {
  task: ReviewTask
  onAccept: (task: ReviewTask) => void
  onResume: (task: ReviewTask) => void
  onStart: (task: ReviewTask) => void
  getStatusBadge: (status: string) => React.ReactNode
  isLocked: boolean
}

export function TaskCard({ task, onAccept, onResume, onStart, getStatusBadge, isLocked }: TaskCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (task.leaseExpiresAt) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((task.leaseExpiresAt! - Date.now()) / 1000))
        setTimeRemaining(remaining)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [task.leaseExpiresAt])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const canAccept = (task.status === "AVAILABLE" || task.status === "REQUEUED") && !isLocked
  const canResume = task.status === "LEASED" || task.status === "IN_PROGRESS"
  const isCompleted =
    task.status === "APPROVED" ||
    task.status === "REJECTED" ||
    task.status === "SUBMITTED" ||
    task.status === "QC_PENDING"

  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary shrink-0">
            <Play className="h-5 w-5 text-secondary-foreground" />
          </div>

          <div className="grid gap-2 md:grid-cols-5 md:gap-6 flex-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{task.videoSegmentLength}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{task.language}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-accent">${task.payAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">{getStatusBadge(task.status)}</div>
            {timeRemaining !== null && canResume && (
              <div className="flex items-center gap-2">
                <Timer
                  className={`h-4 w-4 ${timeRemaining < 120 ? "text-red-600 dark:text-red-500" : "text-yellow-600 dark:text-yellow-500"}`}
                />
                <span
                  className={`text-sm font-medium ${timeRemaining < 120 ? "text-red-600 dark:text-red-500" : "text-yellow-600 dark:text-yellow-500"}`}
                >
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0">
          {canAccept && (
            <Button size="sm" onClick={() => onAccept(task)}>
              Accept
            </Button>
          )}
          {canResume && (
            <Button size="sm" onClick={() => onStart(task)}>
              {task.status === "LEASED" ? "Start" : "Resume"}
            </Button>
          )}
          {isCompleted && (
            <Button size="sm" variant="outline" disabled>
              View Details
            </Button>
          )}
        </div>
      </div>

      {/* Show time remaining warning */}
      {timeRemaining !== null && timeRemaining < 120 && canResume && (
        <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
          <p className="text-sm text-red-600 dark:text-red-500 font-medium">
            ⚠️ Less than 2 minutes remaining! Complete soon or task will be requeued.
          </p>
        </div>
      )}

      {/* Show rejection reason if rejected */}
      {task.status === "REJECTED" && (
        <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
          <p className="text-sm text-red-600 dark:text-red-500">
            Task rejected during quality check. Review feedback guidelines.
          </p>
        </div>
      )}
    </div>
  )
}
