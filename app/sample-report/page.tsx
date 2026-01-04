import type { Metadata } from "next"
import { SampleReportClient } from "./sample-report-client"

export const metadata: Metadata = {
  title: "Sample Report",
  description:
    "See a real example of a Content Diagnostics report with AI analysis, human reviewer feedback, timeline insights, and actionable recommendations.",
}

export default function SampleReportPage() {
  return <SampleReportClient />
}
