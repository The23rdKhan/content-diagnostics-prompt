"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X, Play, AlertCircle } from "lucide-react"
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
}

export function TaskCompletionModal({ task, onClose, onSubmit }: TaskCompletionModalProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [watchTime, setWatchTime] = useState(0)
  const [canSubmit, setCanSubmit] = useState(false)
  const [videoStarted, setVideoStarted] = useState(false)
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
            <p className="text-sm text-muted-foreground">* Required fields</p>
            <Button onClick={handleSubmit} disabled={!allRequiredAnswered || !canSubmit}>
              Submit Feedback
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
