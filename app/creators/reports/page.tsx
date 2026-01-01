"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Filter,
  Clock,
  CheckCircle2,
  Users,
  AlertCircle,
  FileText,
  Download,
  GitCompare,
  X,
  ChevronDown,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { trackEvent } from "@/lib/analytics"
import {
  mockReports,
  languagePoolLabels,
  statusLabels,
  type Report,
  type ReportStatus,
  type LanguagePool,
  type VideoLength,
} from "@/lib/reports-data"

type SortOption = "newest" | "oldest" | "fastest" | "highest_severity"

export default function ReportsListPage() {
  const [reports, setReports] = useState<Report[]>(mockReports)
  const [filteredReports, setFilteredReports] = useState<Report[]>(mockReports)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([])

  // Filter states
  const [statusFilter, setStatusFilter] = useState<ReportStatus[]>([])
  const [languageFilter, setLanguageFilter] = useState<LanguagePool[]>([])
  const [lengthFilter, setLengthFilter] = useState<VideoLength[]>([])
  const [sortBy, setSortBy] = useState<SortOption>("newest")

  useEffect(() => {
    trackEvent("report_list_viewed")
  }, [])

  useEffect(() => {
    let filtered = [...reports]

    // Status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter((r) => statusFilter.includes(r.status))
    }

    // Language filter
    if (languageFilter.length > 0) {
      filtered = filtered.filter((r) => languageFilter.includes(r.languagePool))
    }

    // Length filter
    if (lengthFilter.length > 0) {
      filtered = filtered.filter((r) => {
        if (lengthFilter.includes("short") && r.videoDuration < 10) return true
        if (lengthFilter.includes("medium") && r.videoDuration >= 10 && r.videoDuration <= 30) return true
        if (lengthFilter.includes("long") && r.videoDuration > 30) return true
        return false
      })
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime()
        case "oldest":
          return new Date(a.dateSubmitted).getTime() - new Date(b.dateSubmitted).getTime()
        case "fastest":
          if (!a.actualDeliveryTime || !b.actualDeliveryTime) return 0
          const aHours = Number.parseInt(a.actualDeliveryTime)
          const bHours = Number.parseInt(b.actualDeliveryTime)
          return aHours - bHours
        case "highest_severity":
          // For simplicity, sort by engagement score (lower = more issues)
          if (a.status !== "delivered" && b.status === "delivered") return 1
          if (a.status === "delivered" && b.status !== "delivered") return -1
          return a.engagementScore - b.engagementScore
        default:
          return 0
      }
    })

    setFilteredReports(filtered)
  }, [reports, statusFilter, languageFilter, lengthFilter, sortBy])

  const getStatusBadge = (status: ReportStatus) => {
    const styles = {
      delivered: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
      in_progress: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
      awaiting_human: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
      compiling: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    }

    const icons = {
      delivered: CheckCircle2,
      in_progress: Clock,
      awaiting_human: Users,
      compiling: AlertCircle,
    }

    const Icon = icons[status]

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status]}`}
      >
        <Icon className="h-3 w-3" />
        {statusLabels[status]}
      </span>
    )
  }

  const handleCompareClick = () => {
    if (selectedForCompare.length === 2) {
      trackEvent("report_compare_completed", { reports: selectedForCompare })
      window.location.href = `/creators/reports/compare?left=${selectedForCompare[0]}&right=${selectedForCompare[1]}`
    }
  }

  const toggleCompareSelection = (reportId: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(reportId)) {
        return prev.filter((id) => id !== reportId)
      } else if (prev.length < 2) {
        return [...prev, reportId]
      }
      return prev
    })
  }

  const handleEnableCompareMode = () => {
    setCompareMode(true)
    trackEvent("report_compare_mode_enabled")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/creators/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <h1 className="text-xl font-semibold text-foreground">Reports</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Summary Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Reports</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{reports.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Delivered</p>
            <p className="mt-1 text-3xl font-bold text-green-600 dark:text-green-400">
              {reports.filter((r) => r.status === "delivered").length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">In Progress</p>
            <p className="mt-1 text-3xl font-bold text-blue-600 dark:text-blue-400">
              {reports.filter((r) => r.status !== "delivered").length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Avg. Clarity Score</p>
            <p className="mt-1 text-3xl font-bold text-foreground">
              {Math.round(
                reports.filter((r) => r.status === "delivered").reduce((acc, r) => acc + r.clarityScore, 0) /
                  reports.filter((r) => r.status === "delivered").length,
              )}
            </p>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(!isFilterOpen)} className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {(statusFilter.length > 0 || languageFilter.length > 0 || lengthFilter.length > 0) && (
                <span className="rounded-full bg-accent px-1.5 py-0.5 text-xs text-accent-foreground">
                  {statusFilter.length + languageFilter.length + lengthFilter.length}
                </span>
              )}
            </Button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-9 appearance-none rounded-md border border-border bg-card pl-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="fastest">Delivered Fastest</option>
                <option value="highest_severity">Highest Severity</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!compareMode ? (
              <Button variant="outline" size="sm" onClick={handleEnableCompareMode} className="gap-2 bg-transparent">
                <GitCompare className="h-4 w-4" />
                Compare Reports
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCompareMode(false)
                    setSelectedForCompare([])
                  }}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCompareClick}
                  disabled={selectedForCompare.length !== 2}
                  className="gap-2"
                >
                  <GitCompare className="h-4 w-4" />
                  Compare ({selectedForCompare.length}/2)
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="mb-6 rounded-xl border border-border bg-card p-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Status Filter */}
              <div>
                <h3 className="mb-3 font-semibold text-sm text-foreground">Status</h3>
                <div className="space-y-2">
                  {(["delivered", "in_progress", "awaiting_human", "compiling"] as ReportStatus[]).map((status) => (
                    <label key={status} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={statusFilter.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setStatusFilter([...statusFilter, status])
                          } else {
                            setStatusFilter(statusFilter.filter((s) => s !== status))
                          }
                        }}
                        className="rounded border-border"
                      />
                      <span className="text-foreground">{statusLabels[status]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Language Filter */}
              <div>
                <h3 className="mb-3 font-semibold text-sm text-foreground">Language Pool</h3>
                <div className="space-y-2">
                  {(["english_global", "spanish_latam", "portuguese_brazil", "french_europe"] as LanguagePool[]).map(
                    (lang) => (
                      <label key={lang} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={languageFilter.includes(lang)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLanguageFilter([...languageFilter, lang])
                            } else {
                              setLanguageFilter(languageFilter.filter((l) => l !== lang))
                            }
                          }}
                          className="rounded border-border"
                        />
                        <span className="text-foreground">{languagePoolLabels[lang]}</span>
                      </label>
                    ),
                  )}
                </div>
              </div>

              {/* Length Filter */}
              <div>
                <h3 className="mb-3 font-semibold text-sm text-foreground">Video Length</h3>
                <div className="space-y-2">
                  {(["short", "medium", "long"] as VideoLength[]).map((length) => (
                    <label key={length} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={lengthFilter.includes(length)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setLengthFilter([...lengthFilter, length])
                          } else {
                            setLengthFilter(lengthFilter.filter((l) => l !== length))
                          }
                        }}
                        className="rounded border-border"
                      />
                      <span className="text-foreground">
                        {length === "short" && "< 10 min"}
                        {length === "medium" && "10-30 min"}
                        {length === "long" && "30+ min"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {(statusFilter.length > 0 || languageFilter.length > 0 || lengthFilter.length > 0) && (
              <div className="mt-4 pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter([])
                    setLanguageFilter([])
                    setLengthFilter([])
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No reports found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your filters or submit a new video for review.
              </p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report.id}
                className={`rounded-xl border bg-card p-6 transition-all ${
                  compareMode && selectedForCompare.includes(report.id)
                    ? "border-accent ring-2 ring-accent"
                    : "border-border hover:border-accent/50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {compareMode && report.status === "delivered" && (
                      <input
                        type="checkbox"
                        checked={selectedForCompare.includes(report.id)}
                        onChange={() => toggleCompareSelection(report.id)}
                        disabled={!selectedForCompare.includes(report.id) && selectedForCompare.length >= 2}
                        className="mt-1 h-5 w-5 rounded border-border"
                      />
                    )}

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{report.videoTitle}</h3>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span>Duration: {report.duration}</span>
                            <span>•</span>
                            <span>{languagePoolLabels[report.languagePool]}</span>
                            <span>•</span>
                            <span>Submitted: {report.dateSubmitted}</span>
                          </div>
                        </div>
                        {getStatusBadge(report.status)}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 mb-4">
                        <div className="flex items-center gap-3 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">{report.guaranteedReviewers} guaranteed reviewers</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">
                            SLA: {report.slaWindow}
                            {report.actualDeliveryTime && (
                              <span className="text-muted-foreground"> (delivered in {report.actualDeliveryTime})</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {report.status === "delivered" && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {report.aiComplete && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                              AI Complete
                            </span>
                          )}
                          {report.humanComplete && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                              Human Complete
                            </span>
                          )}
                          {report.compiled && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-400">
                              Compiled
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3">
                        <Button size="sm" asChild>
                          <Link href={`/creators/reports/${report.id}`}>
                            <FileText className="h-4 w-4 mr-2" />
                            View Report
                          </Link>
                        </Button>
                        {report.status === "delivered" && (
                          <>
                            <Button variant="outline" size="sm" disabled>
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
