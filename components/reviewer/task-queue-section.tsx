"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { trackEvent } from "@/lib/analytics"
import { Clock, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function TaskQueueSection() {
  const [qualificationPassed, setQualificationPassed] = useState(
    sessionStorage.getItem("qualification_passed") === "true",
  )
  const [activeTask, setActiveTask] = useState<string | null>(null)
  const [tasks, setTasks] = useState([
    {
      id: "task-1",
      videoLength: "8:45",
      language: "English",
      complexity: "Medium",
      payment: "$12.50",
      deadline: "24 hours",
      status: "pending",
    },
    {
      id: "task-2",
      videoLength: "12:30",
      language: "English",
      complexity: "High",
      payment: "$18.50",
      deadline: "48 hours",
      status: "pending",
    },
  ])

  if (!qualificationPassed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Queue</CardTitle>
          <CardDescription>Available review tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-yellow-600/10 border-yellow-600/30">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-600">
              <p className="font-semibold mb-2">Qualification Required</p>
              <p className="text-sm mb-3">
                You must pass the qualification task to access review assignments. Complete the qualification first to
                unlock your task queue.
              </p>
              <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                Go to Qualification
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const handleAcceptTask = (taskId: string) => {
    trackEvent("task_started", { taskId })
    setActiveTask(taskId)
    alert("Task accepted! Mock review interface would appear here.")
    // In production, navigate to review interface
  }

  const handleSubmitTask = (taskId: string) => {
    trackEvent("task_submitted", { taskId })
    setTasks(tasks.filter((t) => t.id !== taskId))
    setActiveTask(null)
    alert("Review submitted! You'll receive payment on your next payout.")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Review Tasks ({tasks.length})</CardTitle>
          <CardDescription>Accept tasks and provide feedback on content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tasks available right now. Check back soon!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">Review Task</h4>
                    <p className="text-sm text-muted-foreground">{task.language} Content</p>
                  </div>
                  <Badge className="bg-green-600">{task.payment}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Length</p>
                    <p className="font-medium">{task.videoLength}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Complexity</p>
                    <p className="font-medium">{task.complexity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Deadline</p>
                    <p className="font-medium flex gap-1">
                      <Clock className="h-4 w-4" />
                      {task.deadline}
                    </p>
                  </div>
                </div>

                {activeTask === task.id ? (
                  <Button onClick={() => handleSubmitTask(task.id)} className="w-full" variant="default">
                    Submit Review
                  </Button>
                ) : (
                  <Button onClick={() => handleAcceptTask(task.id)} className="w-full" variant="outline">
                    Accept Task
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
