"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BarChart3, Download, Eye, TrendingUp, TrendingDown, Minus } from "lucide-react"

const mockReports = [
  {
    id: "1",
    title: "Product Demo v2.mp4",
    date: "2025-12-29",
    clarityScore: 78,
    pacingScore: 85,
    engagementScore: 72,
    trend: "up",
  },
  {
    id: "2",
    title: "Tutorial Episode 4.mov",
    date: "2025-12-25",
    clarityScore: 82,
    pacingScore: 79,
    engagementScore: 88,
    trend: "up",
  },
  {
    id: "3",
    title: "Onboarding Video.mp4",
    date: "2025-12-20",
    clarityScore: 65,
    pacingScore: 70,
    engagementScore: 68,
    trend: "down",
  },
]

export function ReportsSection() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const report = selectedReport ? mockReports.find((r) => r.id === selectedReport) : null

  return (
    <div className="space-y-6">
      {!selectedReport ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Avg. Clarity Score</p>
              <p className="mt-1 text-2xl font-bold text-card-foreground">75</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Avg. Pacing Score</p>
              <p className="mt-1 text-2xl font-bold text-card-foreground">78</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Avg. Engagement</p>
              <p className="mt-1 text-2xl font-bold text-card-foreground">76</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border p-4">
              <h2 className="text-lg font-semibold text-card-foreground">Completed Reports</h2>
            </div>
            <div className="divide-y divide-border">
              {mockReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <BarChart3 className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{report.title}</p>
                      <p className="text-sm text-muted-foreground">Completed {report.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getTrendIcon(report.trend)}
                      <span className="text-sm text-foreground">{report.clarityScore}/100</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedReport(report.id)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => setSelectedReport(null)}>
            ← Back to Reports
          </Button>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">{report?.title}</h2>
                <p className="text-sm text-muted-foreground">Report generated {report?.date}</p>
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
                  This video performed well in terms of pacing but could benefit from improved clarity in the
                  introduction section. Reviewers noted strong engagement in the middle portion but attention drop-off
                  in the final 30 seconds.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">Clarity Score</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">{report?.clarityScore}</p>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-accent" style={{ width: `${report?.clarityScore}%` }} />
                  </div>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">Pacing Score</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">{report?.pacingScore}</p>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-green-500" style={{ width: `${report?.pacingScore}%` }} />
                  </div>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">Engagement Score</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">{report?.engagementScore}</p>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-chart-4" style={{ width: `${report?.engagementScore}%` }} />
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-secondary p-4">
                <h3 className="font-semibold text-secondary-foreground">Timeline Feedback</h3>
                <div className="mt-4 space-y-3">
                  <div className="flex gap-4">
                    <span className="text-sm font-mono text-accent">0:00-0:30</span>
                    <p className="text-sm text-muted-foreground">
                      Opening could be clearer - 40% of reviewers reported confusion
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-sm font-mono text-accent">0:30-2:00</span>
                    <p className="text-sm text-muted-foreground">
                      Strong engagement - clear explanations and good pacing
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-sm font-mono text-accent">2:00-2:45</span>
                    <p className="text-sm text-muted-foreground">
                      Attention drop-off detected - consider adding visual aid
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-secondary p-4">
                <h3 className="font-semibold text-secondary-foreground">Actionable Recommendations</h3>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <li>• Simplify the introduction with a clearer hook statement</li>
                  <li>• Add supporting visuals at the 2:15 timestamp</li>
                  <li>• Strengthen the call-to-action in the closing segment</li>
                  <li>• Consider reducing technical jargon in the first 30 seconds</li>
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
