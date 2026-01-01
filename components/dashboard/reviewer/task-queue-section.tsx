"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, XCircle, Filter, RefreshCw } from "lucide-react"
import { useReviewerTasks, useReviewerProfile } from "@/lib/hooks/use-reviewer"
import type { TaskDto, TaskStatus, ReviewerProfile } from "@/lib/types/api"
import { trackEvent } from "@/lib/analytics"
import { TaskCompletionModal } from "./task-completion-modal"
import { TaskCard } from "./task-card"

type FilterType = "all" | "available" | "in-progress" | "submitted" | "qc-pending" | "approved" | "rejected"

// Helper to format segment duration as mm:ss
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

// Helper to estimate review time based on video duration
function estimateTime(durationSeconds: number): string {
  const minutes = Math.ceil((durationSeconds * 1.5) / 60) // ~1.5x video length
  return `~${minutes} min`
}

export function TaskQueueSection() {
  // Fetch tasks and profile from API
  const { tasks: apiTasks, loading: tasksLoading, error: tasksError, refetch: refetchTasks } = useReviewerTasks()
  const { profile, loading: profileLoading, error: profileError } = useReviewerProfile()

  // Local state for UI interactions
  const [localTasks, setLocalTasks] = useState<TaskDto[]>([])
  const [filter, setFilter] = useState<FilterType>("available")
  const [activeTask, setActiveTask] = useState<TaskDto | null>(null)
  const [showAcceptModal, setShowAcceptModal] = useState<TaskDto | null>(null)
  const [showQualityWarning, setShowQualityWarning] = useState(false)

  // Sync API tasks to local state
  useEffect(() => {
    if (apiTasks.length > 0) {
      setLocalTasks(apiTasks)
    }
  }, [apiTasks])

  // Derive quality profile state
  const qualityProfile = useMemo(() => ({
    score: profile?.qualityScore ?? 100,
    tasksCompleted: profile?.tasksCompleted ?? 0,
    isLocked: profile?.queueLocked ?? false,
  }), [profile])

  const loading = tasksLoading || profileLoading
  const error = tasksError || profileError

  // Handle lease expiration (check every second)
  useEffect(() => {
    const interval = setInterval(() => {
      setLocalTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.status === "LEASED" && task.leaseExpiresAt) {
            const expiresAt = new Date(task.leaseExpiresAt).getTime()
            if (Date.now() > expiresAt) {
              trackEvent("reviewer_task_lease_expired", { taskId: task.id })
              return { ...task, status: "REQUEUED" as TaskStatus, leaseExpiresAt: undefined }
            }
          }
          // Auto-transition REQUEUED back to AVAILABLE after 1 second
          if (task.status === "REQUEUED") {
            setTimeout(() => {
              setLocalTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: "AVAILABLE" as TaskStatus } : t)))
            }, 1000)
          }
          return task
        }),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Poll for task updates (QC results come from backend)
  useEffect(() => {
    const pollInterval = setInterval(() => {
      refetchTasks()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(pollInterval)
  }, [refetchTasks])

  // Show quality warning when score drops
  useEffect(() => {
    if (qualityProfile.score < 70 && !showQualityWarning) {
      setShowQualityWarning(true)
      trackEvent("reviewer_quality_warning_shown", { score: qualityProfile.score })
    }
  }, [qualityProfile.score, showQualityWarning])

  const handleAcceptTask = (task: TaskDto) => {
    setShowAcceptModal(task)
  }

  const confirmAcceptTask = () => {
    if (!showAcceptModal) return

    const leaseTime = 10 * 60 * 1000 // 10 minutes
    const updatedTask: TaskDto = {
      ...showAcceptModal,
      status: "LEASED" as TaskStatus,
      leaseExpiresAt: new Date(Date.now() + leaseTime).toISOString(),
    }

    setLocalTasks((prevTasks) => prevTasks.map((t) => (t.id === showAcceptModal.id ? updatedTask : t)))

    trackEvent("reviewer_task_accepted", {
      taskId: showAcceptModal.id,
      language: showAcceptModal.language,
      payAmount: showAcceptModal.payAmount,
    })

    setShowAcceptModal(null)
  }

  const handleResumeTask = (task: TaskDto) => {
    setActiveTask(task)
    trackEvent("reviewer_task_resumed", { taskId: task.id })
  }

  const handleStartTask = (task: TaskDto) => {
    const updatedTask: TaskDto = { ...task, status: "IN_PROGRESS" as TaskStatus }
    setLocalTasks((prevTasks) => prevTasks.map((t) => (t.id === task.id ? updatedTask : t)))
    setActiveTask(updatedTask)
    trackEvent("reviewer_task_started", { taskId: task.id })
  }

  const handleTaskSubmit = (taskId: string, answers: Record<string, string>, watchTime: number) => {
    const numericId = parseInt(taskId, 10)
    const task = localTasks.find((t) => t.id === numericId)
    if (!task) return

    // Check attention check (frontend validation - backend will also validate)
    const attentionCheckQuestion = task.questions[task.attentionCheckIndex ?? 0]
    const attentionCheckPassed = !attentionCheckQuestion || answers[attentionCheckQuestion.id] !== undefined

    // Check completion time (too fast = suspicious)
    const minWatchTime = task.segmentDurationSeconds * 0.7 // Must watch at least 70% of video duration
    const completedTooFast = watchTime < minWatchTime

    // Update local state optimistically
    const newStatus: TaskStatus = !attentionCheckPassed || completedTooFast ? "REJECTED" : "QC_PENDING"

    if (!attentionCheckPassed || completedTooFast) {
      trackEvent("reviewer_task_qc_rejected", {
        taskId,
        reason: !attentionCheckPassed ? "attention_check_failed" : "completed_too_fast",
        watchTime,
      })
    } else {
      trackEvent("reviewer_task_submitted", { taskId, watchTime, attentionCheckPassed })
    }

    setLocalTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === numericId
          ? {
              ...t,
              status: newStatus,
              submittedAt: new Date().toISOString(),
              reviewedAt: newStatus === "REJECTED" ? new Date().toISOString() : undefined,
            }
          : t,
      ),
    )

    setActiveTask(null)
    // Refetch to get actual backend status
    setTimeout(() => refetchTasks(), 1000)
  }

  const filteredTasks = localTasks.filter((task) => {
    if (filter === "all") return true
    if (filter === "available") return task.status === "AVAILABLE" || task.status === "REQUEUED"
    if (filter === "in-progress") return task.status === "LEASED" || task.status === "IN_PROGRESS"
    if (filter === "submitted") return task.status === "SUBMITTED"
    if (filter === "qc-pending") return task.status === "QC_PENDING"
    if (filter === "approved") return task.status === "APPROVED"
    if (filter === "rejected") return task.status === "REJECTED"
    return true
  })

  const getStatusBadge = (status: TaskStatus) => {
    const badges = {
      AVAILABLE: (
        <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-500">
          Available
        </span>
      ),
      REQUEUED: (
        <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-500">
          Requeued
        </span>
      ),
      LEASED: (
        <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-500">
          Leased
        </span>
      ),
      IN_PROGRESS: (
        <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-500">
          In Progress
        </span>
      ),
      SUBMITTED: (
        <span className="rounded-full bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-600 dark:text-purple-500">
          Submitted
        </span>
      ),
      QC_PENDING: (
        <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-500">
          QC Pending
        </span>
      ),
      APPROVED: (
        <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-500">
          Approved
        </span>
      ),
      REJECTED: (
        <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-600 dark:text-red-500">
          Rejected
        </span>
      ),
    }
    return badges[status]
  }

  const availableCount = localTasks.filter((t) => t.status === "AVAILABLE" || t.status === "REQUEUED").length
  const inProgressCount = localTasks.filter((t) => t.status === "LEASED" || t.status === "IN_PROGRESS").length
  const completedToday = localTasks.filter((t) => {
    if (t.status !== "APPROVED" || !t.reviewedAt) return false
    const reviewedAt = new Date(t.reviewedAt).getTime()
    return Date.now() - reviewedAt < 86400000
  }).length
  const earnedToday = localTasks
    .filter((t) => {
      if (t.status !== "APPROVED" || !t.reviewedAt) return false
      const reviewedAt = new Date(t.reviewedAt).getTime()
      return Date.now() - reviewedAt < 86400000
    })
    .reduce((sum, t) => sum + t.payAmount, 0)

  if (activeTask) {
    return <TaskCompletionModal task={activeTask} onClose={() => setActiveTask(null)} onSubmit={handleTaskSubmit} />
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-destructive bg-destructive/5 p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-bold text-destructive">Failed to Load Tasks</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Unable to fetch task data. Please try again.
        </p>
        <Button className="mt-4" onClick={() => refetchTasks()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quality Warning */}
      {showQualityWarning && qualityProfile.score < 70 && (
        <div className="rounded-xl border border-red-500 bg-red-500/5 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-600 dark:text-red-500">Quality Score Warning</h3>
              <p className="mt-1 text-sm text-red-600/80 dark:text-red-500/80">
                Your quality score has dropped to {qualityProfile.score}.
                {qualityProfile.isLocked
                  ? " Your task queue is locked. Please contact support to re-qualify."
                  : " Maintain high quality to avoid queue restrictions."}
              </p>
              {qualityProfile.warnings.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-red-600/80 dark:text-red-500/80">
                  {qualityProfile.warnings.slice(-3).map((warning, i) => (
                    <li key={i}>• {warning}</li>
                  ))}
                </ul>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="mt-3 text-red-600 dark:text-red-500"
                onClick={() => setShowQualityWarning(false)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Queue Locked Message */}
      {qualityProfile.isLocked && (
        <div className="rounded-xl border border-red-500 bg-red-500/5 p-6 text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-600 dark:text-red-500" />
          <h2 className="mt-4 text-xl font-bold text-red-600 dark:text-red-500">Task Queue Locked</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your quality score is below the threshold. You must re-qualify to access new tasks.
          </p>
          <Button className="mt-4" asChild>
            <a href="/reviewers/onboarding/qualification">Re-qualify Now</a>
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Available Tasks</p>
          {loading ? (
            <Skeleton className="mt-1 h-8 w-16" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-card-foreground">{availableCount}</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">In Progress</p>
          {loading ? (
            <Skeleton className="mt-1 h-8 w-16" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-500">{inProgressCount}</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Completed Today</p>
          {loading ? (
            <Skeleton className="mt-1 h-8 w-16" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-accent">{completedToday}</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Quality Score</p>
          {loading ? (
            <Skeleton className="mt-1 h-8 w-16" />
          ) : (
            <p
              className={`mt-1 text-2xl font-bold ${
                qualityProfile.score >= 80
                  ? "text-green-600 dark:text-green-500"
                  : qualityProfile.score >= 70
                    ? "text-yellow-600 dark:text-yellow-500"
                    : "text-red-600 dark:text-red-500"
              }`}
            >
              {qualityProfile.score}
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === "available" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("available")}
        >
          <Filter className="h-4 w-4 mr-2" />
          Available ({availableCount})
        </Button>
        <Button
          variant={filter === "in-progress" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("in-progress")}
        >
          In Progress ({inProgressCount})
        </Button>
        <Button
          variant={filter === "qc-pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("qc-pending")}
        >
          QC Pending ({localTasks.filter((t) => t.status === "QC_PENDING").length})
        </Button>
        <Button variant={filter === "approved" ? "default" : "outline"} size="sm" onClick={() => setFilter("approved")}>
          Approved ({localTasks.filter((t) => t.status === "APPROVED").length})
        </Button>
        <Button variant={filter === "rejected" ? "default" : "outline"} size="sm" onClick={() => setFilter("rejected")}>
          Rejected ({localTasks.filter((t) => t.status === "REJECTED").length})
        </Button>
        <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
          All Tasks
        </Button>
      </div>

      {/* Task List */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold text-card-foreground">
            {filter === "available"
              ? "Available Tasks"
              : filter === "in-progress"
                ? "In Progress Tasks"
                : filter === "qc-pending"
                  ? "QC Pending Tasks"
                  : filter === "approved"
                    ? "Approved Tasks"
                    : filter === "rejected"
                      ? "Rejected Tasks"
                      : "All Tasks"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="divide-y divide-border">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">No tasks in this category</div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onAccept={handleAcceptTask}
                onResume={handleResumeTask}
                onStart={handleStartTask}
                getStatusBadge={getStatusBadge}
                isLocked={qualityProfile.isLocked}
              />
            ))
          )}
        </div>
      </div>

      {/* Accept Confirmation Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-card-foreground">Accept Task?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You have <strong>10 minutes</strong> to complete this task once accepted. The task will be automatically
              returned to the queue if not submitted in time.
            </p>
            <div className="mt-4 rounded-lg bg-secondary p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">Video length:</span>
                <span className="font-medium text-foreground">{formatDuration(showAcceptModal.segmentDurationSeconds)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-foreground">Payment:</span>
                <span className="font-semibold text-accent">${showAcceptModal.payAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowAcceptModal(null)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={confirmAcceptTask}>
                Accept Task
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
