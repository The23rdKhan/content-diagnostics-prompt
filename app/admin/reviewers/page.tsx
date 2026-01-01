"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdminReviewers, useAdminReviewerStats, type AdminReviewerDto } from "@/lib/hooks/use-admin"
import { Search, ExternalLink, RefreshCw, AlertCircle } from "lucide-react"

export default function ReviewersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const { reviewers, loading, error, refetch } = useAdminReviewers(debouncedSearch || undefined)
  const { stats, loading: statsLoading } = useAdminReviewerStats()

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const getStatusBadge = (status: AdminReviewerDto["status"]) => {
    const badges = {
      active: { label: "Active", variant: "default" as const },
      disabled: { label: "Disabled", variant: "destructive" as const },
      warned: { label: "Warned", variant: "secondary" as const },
    }
    return badges[status]
  }

  const getQualityColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400"
    if (score >= 75) return "text-amber-600 dark:text-amber-400"
    return "text-red-600 dark:text-red-400"
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load reviewers. {error.message}</p>
            </div>
            <Button variant="outline" className="mt-4" onClick={refetch}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reviewer Management</h1>
        <p className="text-muted-foreground mt-1">Monitor reviewer performance and manage reviewer accounts</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reviewers</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-foreground">{stats?.totalReviewers ?? 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Today</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-foreground">{stats?.activeToday ?? 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Quality Score</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-foreground">{stats?.avgQualityScore?.toFixed(1) ?? 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fraud Detections</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-foreground">{stats?.fraudDetections ?? 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fraud Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Fraud Controls</CardTitle>
          <CardDescription>Automated quality and fraud detection settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div>
              <div className="font-medium text-foreground">Auto-disable after failed attention checks</div>
              <div className="text-sm text-muted-foreground">Currently set to 3 consecutive failures</div>
            </div>
            <Button variant="outline" size="sm">Edit</Button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div>
              <div className="font-medium text-foreground">Minimum time-on-task threshold</div>
              <div className="text-sm text-muted-foreground">Tasks completed under 30 seconds flagged for review</div>
            </div>
            <Button variant="outline" size="sm">Edit</Button>
          </div>
        </CardContent>
      </Card>

      {/* Reviewer List */}
      <Card>
        <CardHeader>
          <CardTitle>Reviewer Directory</CardTitle>
          <CardDescription>Search and manage individual reviewer accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reviewer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Languages</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Quality</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Completion</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tasks</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Strikes</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="py-3 px-4">
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-40" />
                      </td>
                      <td className="py-3 px-4"><Skeleton className="h-6 w-24" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-7 w-10" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-12" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-10" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-6 w-8" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-6 w-16" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-8 w-8" /></td>
                    </tr>
                  ))
                ) : reviewers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      {searchQuery ? "No reviewers found matching your search" : "No reviewers found"}
                    </td>
                  </tr>
                ) : (
                  reviewers.map((reviewer) => {
                    const statusBadge = getStatusBadge(reviewer.status)
                    return (
                      <tr key={reviewer.id} className="border-b border-border hover:bg-accent/10">
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground">{reviewer.name}</div>
                          <div className="text-sm text-muted-foreground">{reviewer.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {reviewer.languages.map((lang) => (
                              <Badge key={lang} variant="outline" className="text-xs">
                                {lang.split(" ")[0]}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xl font-bold ${getQualityColor(reviewer.qualityScore)}`}>
                            {reviewer.qualityScore}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-foreground">{reviewer.completionRate}%</td>
                        <td className="py-3 px-4 text-foreground">{reviewer.tasksCompleted}</td>
                        <td className="py-3 px-4">
                          {reviewer.strikes > 0 ? (
                            <Badge variant="destructive">{reviewer.strikes}</Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/reviewers/${reviewer.id}`}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
