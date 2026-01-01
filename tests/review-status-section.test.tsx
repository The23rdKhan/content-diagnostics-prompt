import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ReviewStatusSection } from "@/components/dashboard/creator/review-status-section"

vi.mock("@/lib/hooks/use-creator", () => ({
  useCreatorJobs: () => ({
    jobs: [],
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
  getJobStatusLabel: (status: string) => status,
  getJobStatusHelperText: () => "",
}))

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
}))

describe("ReviewStatusSection", () => {
  it("shows an empty state when there are no jobs", () => {
    render(<ReviewStatusSection />)

    expect(screen.getByText(/no submissions yet/i)).toBeInTheDocument()
    expect(screen.getByText(/upload a video to get started/i)).toBeInTheDocument()
  })
})
