"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, XCircle, Filter } from "lucide-react"
import {
  mockTasks,
  type TaskStatus,
  type ReviewTask,
  initialQualityProfile,
  type ReviewerQualityProfile,
} from "@/lib/task-data"
import { trackEvent } from "@/lib/analytics"
import { TaskCompletionModal } from "./task-completion-modal"
import { TaskCard } from "./task-card" // Import TaskCard component

type FilterType = "all" | "available" | "in-progress" | "submitted" | "qc-pending" | "approved" | "rejected"

export function TaskQueueSection() {
  const [tasks, setTasks] = useState<ReviewTask[]>(mockTasks)
  const [filter, setFilter] = useState<FilterType>("available")
  const [activeTask, setActiveTask] = useState<ReviewTask | null>(null)
  const [showAcceptModal, setShowAcceptModal] = useState<ReviewTask | null>(null)
  const [qualityProfile, setQualityProfile] = useState<ReviewerQualityProfile>(initialQualityProfile)
  const [showQualityWarning, setShowQualityWarning] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.status === "LEASED" && task.leaseExpiresAt && Date.now() > task.leaseExpiresAt) {
            trackEvent("reviewer_task_lease_expired", { taskId: task.id })
            return { ...task, status: "REQUEUED" as TaskStatus, leaseExpiresAt: undefined }
          }
          // Auto-transition REQUEUED back to AVAILABLE after 1 second
          if (task.status === "REQUEUED") {
            setTimeout(() => {
              setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: "AVAILABLE" as TaskStatus } : t)))
            }, 1000)
          }
          return task
        }),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const qcInterval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.status === "QC_PENDING" && task.submittedAt && Date.now() - task.submittedAt > 30000) {
            // Simulate QC approval after 30 seconds
            const approved = Math.random() > 0.2 // 80% approval rate for demo
            trackEvent(approved ? "reviewer_task_qc_approved" : "reviewer_task_qc_rejected", { taskId: task.id })

            // Update quality profile
            if (!approved) {
              setQualityProfile((prev) => {
                const newScore = Math.max(0, prev.score - 10)
                const newProfile = {
                  ...prev,
                  score: newScore,
                  tasksRejected: prev.tasksRejected + 1,
                  warnings: newScore < 70 ? [...prev.warnings, `Quality score dropped to ${newScore}`] : prev.warnings,
                }

                if (newScore < 70 && !showQualityWarning) {
                  setShowQualityWarning(true)
                  trackEvent("reviewer_quality_warning_shown", { score: newScore })
                }

                if (newScore < 60) {
                  trackEvent("reviewer_queue_locked", { score: newScore })
                  return { ...newProfile, isLocked: true }
                }

                return newProfile
              })
            } else {
              setQualityProfile((prev) => ({
                ...prev,
                score: Math.min(100, prev.score + 2),
                tasksApproved: prev.tasksApproved + 1,
              }))
            }

            return {
              ...task,
              status: (approved ? "APPROVED" : "REJECTED") as TaskStatus,
              reviewedAt: Date.now(),
            }
          }
          return task
        }),
      )
    }, 5000)

    return () => clearInterval(qcInterval)
  }, [showQualityWarning])

  const handleAcceptTask = (task: ReviewTask) => {
    setShowAcceptModal(task)
  }

  const confirmAcceptTask = () => {
    if (!showAcceptModal) return

    const leaseTime = 10 * 60 * 1000 // 10 minutes
    const updatedTask = {
      ...showAcceptModal,
      status: "LEASED" as TaskStatus,
      leaseExpiresAt: Date.now() + leaseTime,
    }

    setTasks((prevTasks) => prevTasks.map((t) => (t.id === showAcceptModal.id ? updatedTask : t)))

    trackEvent("reviewer_task_accepted", {
      taskId: showAcceptModal.id,
      language: showAcceptModal.language,
      payAmount: showAcceptModal.payAmount,
    })

    setShowAcceptModal(null)
  }

  const handleResumeTask = (task: ReviewTask) => {
    setActiveTask(task)
    trackEvent("reviewer_task_resumed", { taskId: task.id })
  }

  const handleStartTask = (task: ReviewTask) => {
    const updatedTask = { ...task, status: "IN_PROGRESS" as TaskStatus }
    setTasks((prevTasks) => prevTasks.map((t) => (t.id === task.id ? updatedTask : t)))
    setActiveTask(updatedTask)
    trackEvent("reviewer_task_started", { taskId: task.id })
  }

  const handleTaskSubmit = (taskId: string, answers: Record<string, any>, watchTime: number) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    // Check attention check
    const attentionCheckQuestion = task.questions[task.attentionCheckIndex || 0]
    const attentionCheckPassed =
      attentionCheckQuestion && attentionCheckQuestion.correctAnswer
        ? answers[attentionCheckQuestion.id] === attentionCheckQuestion.correctAnswer
        : true

    // Check completion time (too fast = suspicious)
    const minWatchTime = task.videoSegmentDuration * 0.7 // Must watch at least 70% of video duration
    const completedTooFast = watchTime < minWatchTime

    let newStatus: TaskStatus = "SUBMITTED"

    // Auto-reject if failed attention check or too fast
    if (!attentionCheckPassed || completedTooFast) {
      newStatus = "REJECTED"
      trackEvent("reviewer_task_qc_rejected", {
        taskId,
        reason: !attentionCheckPassed ? "attention_check_failed" : "completed_too_fast",
        watchTime,
      })

      // Update quality profile
      setQualityProfile((prev) => {
        const newScore = Math.max(0, prev.score - 15)
        const newProfile = {
          ...prev,
          score: newScore,
          tasksRejected: prev.tasksRejected + 1,
          warnings: [...prev.warnings, !attentionCheckPassed ? "Failed attention check" : "Completed task too quickly"],
        }

        if (newScore < 70 && !showQualityWarning) {
          setShowQualityWarning(true)
          trackEvent("reviewer_quality_warning_shown", { score: newScore })
        }

        if (newScore < 60) {
          trackEvent("reviewer_queue_locked", { score: newScore })
          return { ...newProfile, isLocked: true }
        }

        return newProfile
      })
    } else {
      newStatus = "QC_PENDING"
      trackEvent("reviewer_task_submitted", { taskId, watchTime, attentionCheckPassed })
    }

    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              submittedAt: Date.now(),
              reviewedAt: newStatus === "REJECTED" ? Date.now() : undefined,
            }
          : t,
      ),
    )

    setQualityProfile((prev) => ({
      ...prev,
      tasksCompleted: prev.tasksCompleted + 1,
    }))

    setActiveTask(null)
  }

  const filteredTasks = tasks.filter((task) => {
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

  const availableCount = tasks.filter((t) => t.status === "AVAILABLE" || t.status === "REQUEUED").length
  const inProgressCount = tasks.filter((t) => t.status === "LEASED" || t.status === "IN_PROGRESS").length
  const completedToday = tasks.filter(
    (t) => t.status === "APPROVED" && t.reviewedAt && Date.now() - t.reviewedAt < 86400000,
  ).length
  const earnedToday = tasks
    .filter((t) => t.status === "APPROVED" && t.reviewedAt && Date.now() - t.reviewedAt < 86400000)
    .reduce((sum, t) => sum + t.payAmount, 0)

  if (activeTask) {
    return <TaskCompletionModal task={activeTask} onClose={() => setActiveTask(null)} onSubmit={handleTaskSubmit} />
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
          <p className="mt-1 text-2xl font-bold text-card-foreground">{availableCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">In Progress</p>
          <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-500">{inProgressCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Completed Today</p>
          <p className="mt-1 text-2xl font-bold text-accent">{completedToday}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Quality Score</p>
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
          QC Pending ({tasks.filter((t) => t.status === "QC_PENDING").length})
        </Button>
        <Button variant={filter === "approved" ? "default" : "outline"} size="sm" onClick={() => setFilter("approved")}>
          Approved ({tasks.filter((t) => t.status === "APPROVED").length})
        </Button>
        <Button variant={filter === "rejected" ? "default" : "outline"} size="sm" onClick={() => setFilter("rejected")}>
          Rejected ({tasks.filter((t) => t.status === "REJECTED").length})
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
                <span className="font-medium text-foreground">{showAcceptModal.videoSegmentLength}</span>
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
