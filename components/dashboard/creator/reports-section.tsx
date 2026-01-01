"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, Download, Eye, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react"
import { useCreatorReports } from "@/lib/hooks/use-creator"
import type { ReportDto } from "@/lib/types/api"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"

export function ReportsSection() {
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null)
  const { reports, loading, error, refetch } = useCreatorReports()

  // Calculate average scores
  const avgScores = useMemo(() => {
    if (!reports.length) return { clarity: 0, pacing: 0, engagement: 0 }
    const completed = reports.filter((r) => r.clarityScore !== undefined)
    if (!completed.length) return { clarity: 0, pacing: 0, engagement: 0 }
    return {
      clarity: Math.round(completed.reduce((sum, r) => sum + (r.clarityScore || 0), 0) / completed.length),
      pacing: Math.round(completed.reduce((sum, r) => sum + (r.pacingScore || 0), 0) / completed.length),
      engagement: Math.round(completed.reduce((sum, r) => sum + (r.engagementScore || 0), 0) / completed.length),
    }
  }, [reports])

  const getTrendIcon = (report: ReportDto) => {
    // Determine trend based on engagement score vs average
    const avgEngagement = avgScores.engagement
    const score = report.engagementScore || 0
    if (score > avgEngagement + 5) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (score < avgEngagement - 5) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  // Error state
  if (error) {
    const message = error.message === "Access denied."
      ? "Access denied. You do not have permission to view reports."
      : "Failed to load reports"
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
        <p className="mt-2 text-destructive">{message}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    )
  }

  const selectedReport = selectedReportId ? reports.find((r) => r.id === selectedReportId) : null

  return (
    <div className="space-y-6">
      {!selectedReportId ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Avg. Clarity Score</p>
              <p className="mt-1 text-2xl font-bold text-card-foreground">{avgScores.clarity}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Avg. Pacing Score</p>
              <p className="mt-1 text-2xl font-bold text-card-foreground">{avgScores.pacing}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Avg. Engagement</p>
              <p className="mt-1 text-2xl font-bold text-card-foreground">{avgScores.engagement}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border p-4">
              <h2 className="text-lg font-semibold text-card-foreground">Completed Reports</h2>
            </div>
            {reports.length === 0 ? (
              <div className="p-6">
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>No reports yet</EmptyTitle>
                    <EmptyDescription>Upload a video to get started.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <BarChart3 className="h-4 w-4 text-secondary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{report.videoTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          Completed {report.dateCompleted ? new Date(report.dateCompleted).toLocaleDateString() : "Pending"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getTrendIcon(report)}
                        <span className="text-sm text-foreground">{report.clarityScore || 0}/100</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedReportId(report.id)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => setSelectedReportId(null)}>
            ← Back to Reports
          </Button>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">{selectedReport?.videoTitle}</h2>
                <p className="text-sm text-muted-foreground">
                  Report generated {selectedReport?.dateCompleted ? new Date(selectedReport.dateCompleted).toLocaleDateString() : "Pending"}
                </p>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg bg-secondary p-4">
                <h3 className="font-semibold text-secondary-foreground">Executive Summary</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedReport?.executiveSummary ||
                    "This video performed well in terms of pacing but could benefit from improved clarity in the introduction section. Reviewers noted strong engagement in the middle portion but attention drop-off in the final 30 seconds."}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">Clarity Score</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">{selectedReport?.clarityScore || 0}</p>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-accent" style={{ width: `${selectedReport?.clarityScore || 0}%` }} />
                  </div>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">Pacing Score</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">{selectedReport?.pacingScore || 0}</p>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-green-500" style={{ width: `${selectedReport?.pacingScore || 0}%` }} />
                  </div>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">Engagement Score</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">{selectedReport?.engagementScore || 0}</p>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-chart-4" style={{ width: `${selectedReport?.engagementScore || 0}%` }} />
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-secondary p-4">
                <h3 className="font-semibold text-secondary-foreground">Timeline Feedback</h3>
                <div className="mt-4 space-y-3">
                  {selectedReport?.timelineInsights?.length ? (
                    selectedReport.timelineInsights.map((insight, i) => (
                      <div key={i} className="flex gap-4">
                        <span className="text-sm font-mono text-accent">{insight.timestamp}</span>
                        <p className="text-sm text-muted-foreground">{insight.observation}</p>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex gap-4">
                        <span className="text-sm font-mono text-accent">0:00-0:30</span>
                        <p className="text-sm text-muted-foreground">Opening analysis pending...</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-secondary p-4">
                <h3 className="font-semibold text-secondary-foreground">Actionable Recommendations</h3>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  {selectedReport?.actionPlan?.length ? (
                    selectedReport.actionPlan.map((item, i) => (
                      <li key={i}>• {item.action}</li>
                    ))
                  ) : (
                    <>
                      <li>• Analysis in progress...</li>
                    </>
                  )}
                </ul>
              </div>

              <p className="text-xs text-muted-foreground italic">
                Disclaimer: Feedback is for internal testing and improvement purposes only.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
