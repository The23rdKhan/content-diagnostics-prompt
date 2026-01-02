"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCreatorReport } from "@/lib/hooks/use-creator"
import {
  ArrowLeft,
  Download,
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle2,
  Users,
  RefreshCw,
} from "lucide-react"

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = params.id ? parseInt(params.id as string, 10) : null

  const { report, loading, error, refetch } = useCreatorReport(reportId)

  // Calculate overall score from available scores
  const calculateOverallScore = () => {
    if (!report) return null
    const scores = [
      report.clarityScore,
      report.pacingScore,
      report.engagementScore,
      report.structureScore,
    ].filter((s): s is number => s !== undefined && s !== null)

    if (scores.length === 0) return null
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
  }

  // Format duration
  const formatDuration = (minutes?: number) => {
    if (!minutes) return "N/A"
    const mins = Math.floor(minutes)
    const secs = Math.round((minutes - mins) * 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500/10 text-green-600 dark:text-green-400"
      case "IN_PROGRESS":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Delivered"
      case "IN_PROGRESS":
        return "In Progress"
      case "PENDING":
        return "Pending"
      default:
        return status
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-28" />
          </div>
          <Skeleton className="h-48 w-full rounded-xl mb-8" />
          <Skeleton className="h-64 w-full rounded-xl mb-8" />
          <Skeleton className="h-48 w-full rounded-xl mb-8" />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-lg">
          <div className="rounded-xl border border-destructive bg-destructive/5 p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-xl font-bold text-destructive">Failed to Load Report</h2>
            <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Not found state
  if (!report) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-lg">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-bold text-card-foreground">Report Not Found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This report doesn&apos;t exist or you don&apos;t have access to it.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/creators/reports">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Reports
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const overallScore = calculateOverallScore()

  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/creators/reports">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Report Header */}
        <div className="rounded-xl border border-border bg-card p-8 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">{report.videoTitle}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Duration: {report.duration || formatDuration(report.videoDurationMinutes)} •
                Language: {report.languagePool} •
                {report.dateCompleted
                  ? ` Completed: ${new Date(report.dateCompleted).toLocaleDateString()}`
                  : ` Submitted: ${new Date(report.dateSubmitted).toLocaleDateString()}`}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(report.status)}`}>
              {getStatusLabel(report.status)}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-accent" />
                <p className="text-xs text-muted-foreground">Overall Score</p>
              </div>
              <p className="mt-2 text-2xl font-bold text-card-foreground">
                {overallScore ? `${overallScore}/10` : "Pending"}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                <p className="text-xs text-muted-foreground">Reviewers</p>
              </div>
              <p className="mt-2 text-2xl font-bold text-card-foreground">
                {report.guaranteedReviewers} human
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent" />
                <p className="text-xs text-muted-foreground">Delivery</p>
              </div>
              <p className="mt-2 text-2xl font-bold text-card-foreground">
                {report.actualDeliveryTime || report.slaWindow || "Pending"}
              </p>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        {report.executiveSummary && (
          <div className="rounded-xl border border-border bg-card p-8 mb-8">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">Executive Summary</h2>
            <p className="text-sm text-muted-foreground">{report.executiveSummary}</p>
          </div>
        )}

        {/* Timeline Insights */}
        {report.timelineInsights && report.timelineInsights.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-8 mb-8">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">Timeline Feedback</h2>
            <div className="space-y-4">
              {report.timelineInsights.map((insight, index) => (
                <div
                  key={index}
                  className={`border-l-2 pl-4 ${
                    insight.severity === "warning" || insight.severity === "high"
                      ? "border-yellow-500"
                      : "border-accent"
                  }`}
                >
                  <p className="text-xs text-muted-foreground mb-1">{insight.timestamp}</p>
                  <p className="text-sm text-card-foreground">{insight.observation}</p>
                  {insight.category && (
                    <p className="text-xs text-muted-foreground mt-1">Category: {insight.category}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Plan */}
        {report.actionPlan && report.actionPlan.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-8 mb-8">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">Action Plan</h2>
            <div className="space-y-4">
              {report.actionPlan.map((item, index) => (
                <div key={index} className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm font-medium text-card-foreground mb-2">
                    {index + 1}. {item.action}
                  </p>
                  <p className="text-sm text-muted-foreground">{item.why}</p>
                  {item.expectedResult && (
                    <p className="text-xs text-accent mt-2">Expected: {item.expectedResult}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Diagnostics */}
        {(report.clarityScore !== undefined ||
          report.pacingScore !== undefined ||
          report.engagementScore !== undefined ||
          report.structureScore !== undefined) && (
          <div className="rounded-xl border border-border bg-card p-8 mb-8">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">AI Diagnostics</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {report.clarityScore !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Clarity Score</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-accent"
                        style={{ width: `${report.clarityScore * 10}%` }}
                      />
                    </div>
                    <p className="text-sm font-medium text-card-foreground">
                      {report.clarityScore.toFixed(1)}/10
                    </p>
                  </div>
                </div>
              )}
              {report.pacingScore !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Pacing Score</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-muted">
                      <div
                        className={`h-2 rounded-full ${report.pacingScore >= 7 ? "bg-accent" : "bg-yellow-500"}`}
                        style={{ width: `${report.pacingScore * 10}%` }}
                      />
                    </div>
                    <p className="text-sm font-medium text-card-foreground">
                      {report.pacingScore.toFixed(1)}/10
                    </p>
                  </div>
                </div>
              )}
              {report.engagementScore !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Engagement Score</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-accent"
                        style={{ width: `${report.engagementScore * 10}%` }}
                      />
                    </div>
                    <p className="text-sm font-medium text-card-foreground">
                      {report.engagementScore.toFixed(1)}/10
                    </p>
                  </div>
                </div>
              )}
              {report.structureScore !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Structure Score</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-accent"
                        style={{ width: `${report.structureScore * 10}%` }}
                      />
                    </div>
                    <p className="text-sm font-medium text-card-foreground">
                      {report.structureScore.toFixed(1)}/10
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Human Reviews */}
        {report.humanReviews?.comments && report.humanReviews.comments.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-8 mb-8">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">Reviewer Comments</h2>
            <div className="space-y-4">
              {report.humanReviews.comments.map((comment, index) => (
                <div key={index} className="border-l-2 border-accent pl-4">
                  <p className="text-sm text-card-foreground">&ldquo;{comment}&rdquo;</p>
                  <p className="text-xs text-muted-foreground mt-1">— Reviewer {index + 1}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report not complete message */}
        {report.status !== "COMPLETED" && (
          <div className="rounded-xl border border-accent/50 bg-accent/5 p-8 text-center">
            <Clock className="mx-auto h-8 w-8 text-accent" />
            <h2 className="mt-4 text-xl font-semibold text-card-foreground">Report In Progress</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your report is still being compiled. Check back soon for the full analysis.
            </p>
            <Button className="mt-6" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
