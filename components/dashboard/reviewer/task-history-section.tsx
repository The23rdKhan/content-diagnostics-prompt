"use client"

import { CheckCircle, XCircle, Clock } from "lucide-react"

const mockHistory = [
  { id: "1", date: "Dec 31, 2025", time: "2:45", pay: "$0.30", status: "approved" },
  { id: "2", date: "Dec 31, 2025", time: "1:30", pay: "$0.20", status: "approved" },
  { id: "3", date: "Dec 30, 2025", time: "4:00", pay: "$0.00", status: "rejected" },
  { id: "4", date: "Dec 30, 2025", time: "2:00", pay: "$0.25", status: "approved" },
  { id: "5", date: "Dec 30, 2025", time: "3:15", pay: "$0.35", status: "approved" },
  { id: "6", date: "Dec 29, 2025", time: "2:30", pay: "$0.30", status: "pending" },
  { id: "7", date: "Dec 29, 2025", time: "1:45", pay: "$0.20", status: "approved" },
]

export function TaskHistorySection() {
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
      case "approved":
        return "Approved"
      case "rejected":
        return "Rejected"
      case "pending":
        return "Pending"
      default:
        return status
    }
  }

  const approvedCount = mockHistory.filter((t) => t.status === "approved").length
  const rejectedCount = mockHistory.filter((t) => t.status === "rejected").length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Tasks</p>
          <p className="mt-1 text-2xl font-bold text-card-foreground">{mockHistory.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Approved</p>
          <p className="mt-1 text-2xl font-bold text-green-500">{approvedCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Rejected</p>
          <p className="mt-1 text-2xl font-bold text-red-500">{rejectedCount}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold text-card-foreground">Completed Tasks</h2>
        </div>
        <div className="divide-y divide-border">
          {mockHistory.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div>{getStatusIcon(task.status)}</div>
                <div>
                  <p className="font-medium text-foreground">Video Review Task</p>
                  <p className="text-sm text-muted-foreground">
                    {task.date} • {task.time} video
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-sm font-medium ${task.status === "rejected" ? "text-red-500" : "text-accent"}`}>
                  {task.pay}
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    task.status === "approved"
                      ? "bg-green-500/10 text-green-500"
                      : task.status === "rejected"
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
