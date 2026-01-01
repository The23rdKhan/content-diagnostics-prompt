"use client"

import { useState } from "react"
import { Clock, CheckCircle, AlertCircle, Play, TrendingUp, ChevronRight, Zap, AlertTriangle } from "lucide-react"
import { mockJobs, getJobStatusLabel, getJobStatusHelperText, type Job, type JobStatus } from "@/lib/job-data"
import { Button } from "@/components/ui/button"
import { trackEvent } from "@/lib/analytics"

export function ReviewStatusSection() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)

  const totalJobs = mockJobs.length
  const inReviewCount = mockJobs.filter((j) => ["IN_REVIEW", "PROCESSING", "SEGMENTED"].includes(j.status)).length
  const completedCount = mockJobs.filter((j) => j.status === "DELIVERED").length

  const getStatusColor = (status: JobStatus) => {
    if (status === "DELIVERED") return "text-green-500"
    if (status === "IN_REVIEW" || status === "COMPILING") return "text-accent"
    if (status === "UPLOADING") return "text-yellow-500"
    return "text-muted-foreground"
  }

  const getStatusIcon = (status: JobStatus) => {
    if (status === "DELIVERED") return <CheckCircle className="h-4 w-4" />
    if (status === "IN_REVIEW" || status === "COMPILING") return <Clock className="h-4 w-4" />
    if (status === "UPLOADING") return <TrendingUp className="h-4 w-4" />
    return <AlertCircle className="h-4 w-4" />
  }

  const getSLABadge = (job: Job) => {
    if (job.slaStatus === "at-risk") {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-600 dark:text-yellow-400">
          <AlertTriangle className="h-3 w-3" />
          SLA at risk
        </span>
      )
    }
    if (job.slaStatus === "delivered-early") {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-green-500/10 px-2 py-0.5 text-xs text-green-600 dark:text-green-400">
          <Zap className="h-3 w-3" />
          Delivered early
        </span>
      )
    }
    if (job.slaStatus === "delivered-late") {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-2 py-0.5 text-xs text-red-600 dark:text-red-400">
          SLA exceeded
        </span>
      )
    }
    return null
  }

  const canUpgradeDelivery = (status: JobStatus) => {
    return ["PROCESSING", "SEGMENTED", "IN_REVIEW"].includes(status)
  }

  const handleUpgradeClick = (job: Job) => {
    if (canUpgradeDelivery(job.status)) {
      trackEvent("creator_addon_upgrade_clicked", { jobId: job.id, currentStatus: job.status })
      alert("Upgrade to faster delivery - feature coming soon")
    }
  }

  const handleViewReport = (jobId: string) => {
    trackEvent("creator_status_viewed", { jobId })
    // In production, navigate to /creators/reports/${jobId}
    alert(`Viewing report for job ${jobId}`)
  }

  const selectedJob = selectedJobId ? mockJobs.find((j) => j.id === selectedJobId) : null

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Videos</p>
          <p className="mt-1 text-2xl font-bold text-card-foreground">{totalJobs}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">In Review</p>
          <p className="mt-1 text-2xl font-bold text-accent">{inReviewCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="mt-1 text-2xl font-bold text-green-500">{completedCount}</p>
        </div>
      </div>

      {/* Jobs List */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold text-card-foreground">Recent Submissions</h2>
        </div>
        <div className="divide-y divide-border">
          {mockJobs.map((job) => (
            <div key={job.id} className="p-4 hover:bg-secondary/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary flex-shrink-0">
                    <Play className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground">{job.title}</p>
                      {getSLABadge(job)}
                      <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                        {job.language}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Uploaded {new Date(job.uploadedAt).toLocaleDateString()}
                      {job.deliveredAt && ` • Delivered in ${job.deliveryTimeHours}h`}
                    </p>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div
                          className={`h-2 w-2 rounded-full ${job.timeline.aiDiagnostics === "complete" ? "bg-green-500" : "bg-muted-foreground"}`}
                        />
                        <span
                          className={
                            job.timeline.aiDiagnostics === "complete" ? "text-foreground" : "text-muted-foreground"
                          }
                        >
                          AI Diagnostics: {job.timeline.aiDiagnostics === "complete" ? "Complete" : "Pending"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            job.timeline.humanReview === "complete"
                              ? "bg-green-500"
                              : job.timeline.humanReview === "in-progress"
                                ? "bg-accent"
                                : "bg-muted-foreground"
                          }`}
                        />
                        <span
                          className={
                            job.timeline.humanReview !== "pending" ? "text-foreground" : "text-muted-foreground"
                          }
                        >
                          Human Review:{" "}
                          {job.timeline.humanReview === "complete"
                            ? "Complete"
                            : job.timeline.humanReview === "in-progress"
                              ? `${job.progress.reviewersCompleted}/${job.progress.totalReviewers} reviewers`
                              : "Pending"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            job.timeline.compilingReport === "complete"
                              ? "bg-green-500"
                              : job.timeline.compilingReport === "in-progress"
                                ? "bg-accent"
                                : "bg-muted-foreground"
                          }`}
                        />
                        <span
                          className={
                            job.timeline.compilingReport !== "pending" ? "text-foreground" : "text-muted-foreground"
                          }
                        >
                          Compiling Report:{" "}
                          {job.timeline.compilingReport === "complete"
                            ? "Complete"
                            : job.timeline.compilingReport === "in-progress"
                              ? "In progress"
                              : "Pending"}
                        </span>
                      </div>
                    </div>

                    {/* Status and helper text */}
                    <div className="mt-3 rounded-lg bg-secondary p-2">
                      <p className="text-sm font-medium text-foreground">{getJobStatusLabel(job.status)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{getJobStatusHelperText(job.status)}</p>
                      {job.estimatedDeliveryWindow && job.status !== "DELIVERED" && (
                        <p className="text-xs text-accent mt-1">Est. delivery: {job.estimatedDeliveryWindow}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {job.status === "DELIVERED" ? (
                    <Button size="sm" onClick={() => handleViewReport(job.id)}>
                      View Report
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  ) : canUpgradeDelivery(job.status) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpgradeClick(job)}
                      className="bg-transparent"
                    >
                      <Zap className="mr-1 h-3 w-3" />
                      Upgrade Delivery
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      className="bg-transparent"
                      title="Upgrades unavailable at this stage"
                    >
                      <Zap className="mr-1 h-3 w-3" />
                      Upgrade Delivery
                    </Button>
                  )}
                  <div className={`flex items-center gap-2 text-sm ${getStatusColor(job.status)}`}>
                    {getStatusIcon(job.status)}
                    <span className="text-foreground">{getJobStatusLabel(job.status)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
