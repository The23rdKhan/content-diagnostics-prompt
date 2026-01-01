"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdminTasks, useBulkTaskAction, type AdminTaskDto, type BulkTaskAction } from "@/lib/hooks/use-admin"
import { trackEvent } from "@/lib/analytics"
import { CheckCircle2, XCircle, RefreshCw, DollarSign, Pause, AlertCircle, Loader2 } from "lucide-react"

export default function TasksPage() {
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const { tasks, loading, error, refetch } = useAdminTasks(filterStatus)
  const { executeBulkAction, loading: bulkLoading, error: bulkError } = useBulkTaskAction()
  const [selectedTasks, setSelectedTasks] = useState<number[]>([])

  // Clear selection when filter changes
  useEffect(() => {
    setSelectedTasks([])
  }, [filterStatus])

  const handleBulkAction = async (action: BulkTaskAction) => {
    if (selectedTasks.length === 0) return

    trackEvent(`admin_task_${action}`, { taskCount: selectedTasks.length })

    try {
      await executeBulkAction(selectedTasks, action)
      setSelectedTasks([])
      refetch()
    } catch (err) {
      console.error("Bulk action failed:", err)
    }
  }

  const getStatusBadge = (status: AdminTaskDto["status"]) => {
    const badges = {
      pending: { label: "Pending", variant: "secondary" as const },
      leased: { label: "Leased", variant: "default" as const },
      submitted: { label: "Submitted", variant: "outline" as const },
      approved: { label: "Approved", variant: "default" as const },
      rejected: { label: "Rejected", variant: "destructive" as const },
      requeued: { label: "Requeued", variant: "secondary" as const },
    }
    return badges[status]
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load tasks. {error.message}</p>
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
        <h1 className="text-3xl font-bold text-foreground">Task Queue Management</h1>
        <p className="text-muted-foreground mt-1">Monitor and manage reviewer task assignments and submissions</p>
      </div>

      {/* Task Lifecycle Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Task Lifecycle</CardTitle>
          <CardDescription>Understanding task states and transitions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Pending</Badge>
              <span className="text-muted-foreground">→</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge>Leased</Badge>
              <span className="text-muted-foreground">→</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Submitted</Badge>
              <span className="text-muted-foreground">→</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge>Approved</Badge>
              <span className="text-muted-foreground">/</span>
              <Badge variant="destructive">Rejected</Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Tasks progress from pending → leased (reviewer claimed) → submitted (review complete) → approved/rejected
            (QC decision). Rejected tasks can be requeued for reassignment.
          </p>
        </CardContent>
      </Card>

      {/* Filters and Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Task Queue</CardTitle>
          <CardDescription>Filter, search, and perform bulk actions on tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label>Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="leased">Leased</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="requeued">Requeued</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedTasks.length > 0 && (
              <div className="flex items-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleBulkAction("approve")} disabled={bulkLoading}>
                  {bulkLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Approve ({selectedTasks.length})
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction("reject")} disabled={bulkLoading}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject ({selectedTasks.length})
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction("requeue")} disabled={bulkLoading}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Requeue ({selectedTasks.length})
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction("increase_pay")} disabled={bulkLoading}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Increase Pay
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction("pause")} disabled={bulkLoading}>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
              </div>
            )}
          </div>

          {bulkError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3">
              <p className="text-sm text-destructive">{bulkError.message}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">
                    <Checkbox
                      checked={selectedTasks.length === tasks.length && tasks.length > 0}
                      onCheckedChange={(checked) => {
                        setSelectedTasks(checked ? tasks.map((t) => t.id) : [])
                      }}
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Task ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Video</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Segment</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Language</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Pay</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reviewer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="py-3 px-4"><Skeleton className="h-4 w-4" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-20" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-20" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-12" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-6 w-20" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-20" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-32" /></td>
                    </tr>
                  ))
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-muted-foreground">
                      No tasks found
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => {
                    const statusBadge = getStatusBadge(task.status)
                    return (
                      <tr key={task.id} className="border-b border-border hover:bg-accent/10">
                        <td className="py-3 px-4">
                          <Checkbox
                            checked={selectedTasks.includes(task.id)}
                            onCheckedChange={(checked) => {
                              setSelectedTasks(checked
                                ? [...selectedTasks, task.id]
                                : selectedTasks.filter((id) => id !== task.id)
                              )
                            }}
                          />
                        </td>
                        <td className="py-3 px-4 font-mono text-sm text-foreground">task-{task.id}</td>
                        <td className="py-3 px-4 font-mono text-sm text-foreground">{task.videoId}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{task.segmentTimestamp}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{task.language}</td>
                        <td className="py-3 px-4 text-foreground font-semibold">${task.pay}</td>
                        <td className="py-3 px-4">
                          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{task.reviewerId || "Unassigned"}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(task.createdAt).toLocaleString()}
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
