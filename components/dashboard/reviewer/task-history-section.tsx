"use client"

import { CheckCircle, XCircle, Clock, AlertCircle, RefreshCw } from "lucide-react"
import { useReviewerTaskHistory } from "@/lib/hooks/use-reviewer"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

export function TaskHistorySection() {
  const { history, loading, error, refetch } = useReviewerTaskHistory(0, 20)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "Approved"
      case "REJECTED":
        return "Rejected"
      case "PENDING_QC":
        return "Pending QC"
      case "SUBMITTED":
        return "Submitted"
      default:
        return status
    }
  }

  const normalizeStatus = (status: string) => {
    if (status === "APPROVED") return "approved"
    if (status === "REJECTED") return "rejected"
    return "pending"
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-12" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-destructive bg-destructive/5 p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-bold text-destructive">Failed to Load Task History</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Button className="mt-4" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  const tasks = history?.tasks ?? []
  const stats = history?.stats ?? { totalCompleted: 0, approved: 0, rejected: 0, approvalRate: 0 }

  // Empty state
  if (tasks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Tasks</p>
            <p className="mt-1 text-2xl font-bold text-card-foreground">0</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="mt-1 text-2xl font-bold text-green-500">0</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Rejected</p>
            <p className="mt-1 text-2xl font-bold text-red-500">0</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold text-card-foreground">No completed tasks yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Complete your first task to see it here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Tasks</p>
          <p className="mt-1 text-2xl font-bold text-card-foreground">{stats.totalCompleted}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Approved</p>
          <p className="mt-1 text-2xl font-bold text-green-500">{stats.approved}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Rejected</p>
          <p className="mt-1 text-2xl font-bold text-red-500">{stats.rejected}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-card-foreground">Completed Tasks</h2>
          {stats.approvalRate > 0 && (
            <span className="text-sm text-muted-foreground">
              {stats.approvalRate.toFixed(0)}% approval rate
            </span>
          )}
        </div>
        <div className="divide-y divide-border">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div>{getStatusIcon(normalizeStatus(task.status))}</div>
                <div>
                  <p className="font-medium text-foreground">Video Review Task</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(task.submittedAt || task.createdAt)} • {task.segmentDurationSeconds ? formatDuration(task.segmentDurationSeconds) : "N/A"} video
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-sm font-medium ${normalizeStatus(task.status) === "rejected" ? "text-red-500" : "text-accent"}`}>
                  ${(task.payAmount || 0).toFixed(2)}
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    normalizeStatus(task.status) === "approved"
                      ? "bg-green-500/10 text-green-500"
                      : normalizeStatus(task.status) === "rejected"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-yellow-500/10 text-yellow-500"
                  }`}
                >
                  {getStatusLabel(task.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-card-foreground mb-2">Why tasks get rejected</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Content was skipped or not fully watched</li>
          <li>• Feedback was rushed or irrelevant to the questions</li>
          <li>• Instructions were not followed</li>
          <li>• Repeated low-quality submissions</li>
        </ul>
      </div>
    </div>
  )
}
