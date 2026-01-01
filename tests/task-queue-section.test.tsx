import { describe, it, expect, vi, beforeEach } from "vitest"
import { render } from "@testing-library/react"
import { TaskQueueSection } from "@/components/dashboard/reviewer/task-queue-section"

const refetchTasks = vi.fn()
const refetchEarnings = vi.fn()
const clearActionError = vi.fn()
const toastMock = vi.fn()

vi.mock("@/components/ui/use-toast", () => ({
  toast: toastMock,
}))

vi.mock("@/lib/hooks/use-reviewer", () => ({
  useReviewerTasks: () => ({
    tasks: [],
    loading: false,
    error: null,
    refetch: refetchTasks,
  }),
  useReviewerProfile: () => ({
    profile: {
      qualityScore: 100,
      tasksCompleted: 0,
      queueLocked: false,
    },
    loading: false,
    error: null,
  }),
  useReviewerEarnings: () => ({
    refetch: refetchEarnings,
  }),
  useTaskActions: () => ({
    acceptTask: vi.fn(),
    submitTask: vi.fn(),
    loading: false,
    error: { status: 409, message: "Conflict" },
    clearError: clearActionError,
  }),
}))

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
}))

describe("TaskQueueSection", () => {
  beforeEach(() => {
    refetchTasks.mockClear()
    clearActionError.mockClear()
    toastMock.mockClear()
  })

  it("shows a conflict toast and refetches when a 409 occurs", () => {
    render(<TaskQueueSection />)

    expect(toastMock).toHaveBeenCalledWith({
      title: "Task already taken",
      description: "Another reviewer accepted this task. We refreshed the queue for you.",
    })
    expect(refetchTasks).toHaveBeenCalled()
    expect(clearActionError).toHaveBeenCalled()
  })
})
