"use client"

import { useApi } from "./use-api"
import type { JobDto, ReportDto } from "@/lib/types/api"

/**
 * Hook to fetch creator's jobs.
 */
export function useCreatorJobs() {
  const { data, loading, error, refetch } = useApi<JobDto[]>("/creator/jobs")

  return {
    jobs: data ?? [],
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch creator's reports.
 */
export function useCreatorReports() {
  const { data, loading, error, refetch } = useApi<ReportDto[]>("/creator/reports")

  return {
    reports: data ?? [],
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch a single report by ID.
 */
export function useCreatorReport(reportId: number | null) {
  const { data, loading, error, refetch } = useApi<ReportDto>(
    `/creator/reports/${reportId}`,
    { enabled: reportId !== null }
  )

  return {
    report: data,
    loading,
    error,
    refetch,
  }
}

/**
 * Helper function to get job status label.
 */
export function getJobStatusLabel(status: JobDto["status"]): string {
  const labels: Record<JobDto["status"], string> = {
    UPLOADING: "Uploading",
    UPLOADED: "Uploaded",
    PROCESSING: "Processing video",
    SEGMENTED: "Preparing for review",
    IN_REVIEW: "Being reviewed",
    COMPILING: "Compiling report",
    DELIVERED: "Delivered",
  }
  return labels[status]
}

/**
 * Helper function to get job status helper text.
 */
export function getJobStatusHelperText(status: JobDto["status"]): string {
  const helpers: Record<JobDto["status"], string> = {
    UPLOADING: "Your video is being uploaded to our secure servers.",
    UPLOADED: "Upload complete. Starting AI diagnostics.",
    PROCESSING: "AI is analyzing your video for key metrics and patterns.",
    SEGMENTED: "Video prepared. Assigning to paid human reviewers.",
    IN_REVIEW: "Paid reviewers are completing feedback tasks on your video.",
    COMPILING: "Aggregating reviewer feedback into your report.",
    DELIVERED: "Your report is ready to view.",
  }
  return helpers[status]
}
