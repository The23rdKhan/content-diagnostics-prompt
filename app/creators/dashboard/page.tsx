import type { Metadata } from "next"
import { CreatorDashboard } from "@/components/dashboard/creator-dashboard"

export const metadata: Metadata = {
  title: "Creator Dashboard | Content Diagnostics",
  description: "Manage your video reviews, view reports, and track your subscription.",
}

export default function CreatorDashboardPage() {
  return <CreatorDashboard />
}
