import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

const mockCreateSample = vi.fn(async () => ({
  jobId: 123,
  reportId: 456,
  taskIds: [1, 2, 3],
  creatorEmail: "creator+debug@contentdiagnostics.com",
  reviewerEmail: "reviewer+debug@contentdiagnostics.com",
}))

const mockCompile = vi.fn(async () => ({
  jobId: 123,
  reportId: 456,
  status: "DELIVERED",
}))

const mockRequeue = vi.fn(async () => ({
  requeuedCount: 2,
}))

const mockUseAdminKpis = () => ({
  kpis: {
    totalCreators: 0,
    totalReviewers: 0,
    activeReviewers: 0,
    pendingTasks: 0,
    tasksCompletedToday: 0,
    jobsInProgress: 0,
    jobsDeliveredToday: 0,
    avgDeliveryTimeHours: 0,
    slaComplianceRate: 0,
  },
  loading: false,
  error: null,
  refetch: vi.fn(),
})

const mockUseAdminDebugTools = () => ({
  createSampleData: mockCreateSample,
  triggerReportCompilation: mockCompile,
  requeueExpiredLeases: mockRequeue,
  loading: false,
  error: null,
})

async function loadDashboard() {
  const module = await import("@/app/admin/dashboard/page")
  return module.default
}

describe("AdminDashboard debug tools", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.doMock("@/lib/hooks/use-admin", () => ({
      useAdminKpis: mockUseAdminKpis,
      useAdminDebugTools: mockUseAdminDebugTools,
    }))
    vi.doMock("@/lib/analytics", () => ({
      trackEvent: vi.fn(),
    }))
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_ENV
    vi.clearAllMocks()
  })

  it("hides debug tools when not in staging", async () => {
    process.env.NEXT_PUBLIC_ENV = "production"

    const AdminDashboard = await loadDashboard()
    render(<AdminDashboard />)

    expect(screen.queryByText(/debug tools/i)).not.toBeInTheDocument()
  })

  it("shows debug tools in staging and runs actions", async () => {
    process.env.NEXT_PUBLIC_ENV = "staging"

    const AdminDashboard = await loadDashboard()
    render(<AdminDashboard />)

    expect(screen.getByText(/debug tools/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: /create sample job \+ tasks/i }))
    expect(mockCreateSample).toHaveBeenCalled()

    await userEvent.click(screen.getByRole("button", { name: /trigger report compilation/i }))
    expect(mockCompile).toHaveBeenCalled()

    await userEvent.click(screen.getByRole("button", { name: /requeue expired leases/i }))
    expect(mockRequeue).toHaveBeenCalled()
  })
})
