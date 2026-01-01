"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { tasks as initialTasks } from "@/lib/admin-data"
import type { Task } from "@/lib/admin-data"
import { trackEvent } from "@/lib/analytics"
import { CheckCircle2, XCircle, RefreshCw, DollarSign, Pause } from "lucide-react"

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])

  const filteredTasks = tasks.filter((task) => filterStatus === "all" || task.status === filterStatus)

  const handleBulkAction = (action: string) => {
    console.log("[v0] Bulk action:", action, selectedTasks)
    trackEvent(`admin_task_${action}`, { taskCount: selectedTasks.length })

    if (action === "approve") {
      setTasks(tasks.map((t) => (selectedTasks.includes(t.id) ? { ...t, status: "approved" as const } : t)))
    } else if (action === "reject") {
      setTasks(tasks.map((t) => (selectedTasks.includes(t.id) ? { ...t, status: "rejected" as const } : t)))
    } else if (action === "requeue") {
      setTasks(tasks.map((t) => (selectedTasks.includes(t.id) ? { ...t, status: "requeued" as const } : t)))
    }

    setSelectedTasks([])
  }

  const getStatusBadge = (status: Task["status"]) => {
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
                <Button variant="outline" size="sm" onClick={() => handleBulkAction("approve")}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve ({selectedTasks.length})
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction("reject")}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject ({selectedTasks.length})
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction("requeue")}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Requeue ({selectedTasks.length})
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction("increase_pay")}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Increase Pay
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction("pause")}>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">
                    <Checkbox
                      checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTasks(filteredTasks.map((t) => t.id))
                        } else {
                          setSelectedTasks([])
                        }
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
                {filteredTasks.map((task) => {
                  const statusBadge = getStatusBadge(task.status)
                  return (
                    <tr key={task.id} className="border-b border-border hover:bg-accent/10">
                      <td className="py-3 px-4">
                        <Checkbox
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTasks([...selectedTasks, task.id])
                            } else {
                              setSelectedTasks(selectedTasks.filter((id) => id !== task.id))
                            }
                          }}
                        />
                      </td>
                      <td className="py-3 px-4 font-mono text-sm text-foreground">{task.id}</td>
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
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
