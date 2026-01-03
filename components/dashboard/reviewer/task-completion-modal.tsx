"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X, Play, AlertCircle, Flag } from "lucide-react"
import type { TaskDto } from "@/lib/types/api"

// Helper to format segment duration as mm:ss
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

interface TaskCompletionModalProps {
  task: TaskDto
  onClose: () => void
  onSubmit: (taskId: string, answers: Record<string, string>, watchTime: number) => void
  onReport?: (taskId: string, reason: string, description: string) => void
}

const reportReasons = [
  { value: "explicit", label: "Explicit/Adult Content" },
  { value: "violence", label: "Violence or Gore" },
  { value: "hate", label: "Hate Speech or Discrimination" },
  { value: "illegal", label: "Illegal Activity" },
  { value: "personal", label: "Personal Information Exposed" },
  { value: "other", label: "Other" },
]

export function TaskCompletionModal({ task, onClose, onSubmit, onReport }: TaskCompletionModalProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [watchTime, setWatchTime] = useState(0)
  const [canSubmit, setCanSubmit] = useState(false)
  const [videoStarted, setVideoStarted] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [reportDescription, setReportDescription] = useState("")
  const [isReporting, setIsReporting] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Track actual video watch time
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setWatchTime(Math.floor(videoRef.current.currentTime))
    }
  }

  const handlePlay = () => {
    setVideoStarted(true)
  }

  useEffect(() => {
    const minWatchTime = task.segmentDurationSeconds * 0.7
    if (watchTime >= minWatchTime) {
      setCanSubmit(true)
    }
  }, [watchTime, task.segmentDurationSeconds])

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = () => {
    onSubmit(String(task.id), answers, watchTime)
  }

  const handleReportSubmit = async () => {
    if (!reportReason) return
    setIsReporting(true)
    try {
      if (onReport) {
        onReport(String(task.id), reportReason, reportDescription)
      }
      onClose()
    } finally {
      setIsReporting(false)
    }
  }

  const allRequiredAnswered = task.questions.filter((q) => q.type !== "text").every((q) => answers[q.id] !== undefined)

  const minWatchTime = task.segmentDurationSeconds * 0.7

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm overflow-auto p-4">
      <div className="w-full max-w-4xl bg-card rounded-xl border border-border my-8">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-4 rounded-t-xl">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-card-foreground">Complete Review Task</h2>
            <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
              ${task.payAmount.toFixed(2)}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Video Player */}
          <div>
            <div className="aspect-video rounded-lg bg-secondary flex items-center justify-center overflow-hidden relative">
              {task.videoSegmentUrl ? (
                <video
                  ref={videoRef}
                  src={task.videoSegmentUrl}
                  controls
                  onPlay={handlePlay}
                  onTimeUpdate={handleTimeUpdate}
                  className="w-full h-full object-contain"
                  controlsList="nodownload"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="text-center">
                  <Play className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">Video Player</p>
                  <p className="text-sm text-muted-foreground">Length: {formatDuration(task.segmentDurationSeconds)}</p>
                </div>
              )}
            </div>

            {/* Minimum watch time indicator */}
            {!canSubmit && videoStarted && (
              <div className="mt-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-yellow-600 dark:text-yellow-500">
                      Watch at least {Math.floor(minWatchTime / 60)}:
                      {Math.floor(minWatchTime % 60)
                        .toString()
                        .padStart(2, "0")}
                      of the video before submitting.
                    </p>
                    <div className="mt-2 w-full bg-yellow-500/20 rounded-full h-2">
                      <div
                        className="bg-yellow-600 dark:bg-yellow-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (watchTime / minWatchTime) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Questions */}
          <div className="space-y-6">
            <h3 className="font-semibold text-card-foreground">Feedback Questions</h3>

            {task.questions.map((question, index) => (
              <div key={question.id}>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {index + 1}. {question.question}
                  {question.type !== "text" && <span className="text-red-500 ml-1">*</span>}
                </label>

                {question.type === "scale" && question.options && (
                  <div className="flex flex-wrap gap-2">
                    {question.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleAnswer(question.id, option)}
                        className={`flex-1 min-w-[120px] rounded-lg border px-3 py-2 text-sm transition-colors ${
                          answers[question.id] === option
                            ? "border-accent bg-accent/10 text-accent font-medium"
                            : "border-border text-foreground hover:bg-secondary"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {question.type === "choice" && question.options && (
                  <div className="flex flex-wrap gap-2">
                    {question.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleAnswer(question.id, option)}
                        className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                          answers[question.id] === option
                            ? "border-accent bg-accent/10 text-accent font-medium"
                            : "border-border text-foreground hover:bg-secondary"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {question.type === "attention-check" && question.options && (
                  <div className="flex flex-wrap gap-2">
                    {question.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleAnswer(question.id, option)}
                        className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                          answers[question.id] === option
                            ? "border-accent bg-accent/10 text-accent font-medium"
                            : "border-border text-foreground hover:bg-secondary"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {question.type === "text" && (
                  <textarea
                    value={answers[question.id] || ""}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-20"
                    placeholder="Your feedback..."
                  />
                )}
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">* Required fields</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowReportModal(true)}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950"
              >
                <Flag className="h-4 w-4 mr-2" />
                Report & Exit
              </Button>
              <Button onClick={handleSubmit} disabled={!allRequiredAnswered || !canSubmit}>
                Submit Feedback
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                <Flag className="h-5 w-5 text-red-500" />
                Report Content
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowReportModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
                <p className="text-sm text-yellow-600 dark:text-yellow-500">
                  Your wellbeing is our priority. If this content is distressing, please report it and exit. You will not be penalized.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Why are you reporting this content? *
                </label>
                <div className="space-y-2">
                  {reportReasons.map((reason) => (
                    <button
                      key={reason.value}
                      onClick={() => setReportReason(reason.value)}
                      className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition-colors ${
                        reportReason === reason.value
                          ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
                          : "border-border text-foreground hover:bg-secondary"
                      }`}
                    >
                      {reason.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Additional details (optional)
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-20"
                  placeholder="Provide any additional context..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowReportModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleReportSubmit}
                  disabled={!reportReason || isReporting}
                >
                  {isReporting ? "Reporting..." : "Report & Exit"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
