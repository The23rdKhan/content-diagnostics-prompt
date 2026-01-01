import type { Metadata } from "next"
import { ReviewerDashboard } from "@/components/dashboard/reviewer-dashboard"

export const metadata: Metadata = {
  title: "Reviewer Dashboard | Content Diagnostics",
  description: "Browse available review tasks, track your earnings, and manage your reviewer account.",
}

export default function ReviewerDashboardPage() {
  return <ReviewerDashboard />
}
