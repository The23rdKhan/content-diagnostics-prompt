export type JobStatus = "UPLOADING" | "UPLOADED" | "PROCESSING" | "SEGMENTED" | "IN_REVIEW" | "COMPILING" | "DELIVERED"

export interface Job {
  id: string
  title: string
  fileName: string
  fileSize: number
  status: JobStatus
  language: string
  uploadedAt: string
  deliveredAt?: string
  slaHours: number
  guaranteedReviewers: number
  actualReviewers?: number
  addons: {
    extraReviewers?: 10 | 25
    fasterDelivery?: boolean
    fullWatchSummary?: boolean
    liveFeedback?: boolean
  }
  timeline: {
    aiDiagnostics: "pending" | "complete"
    humanReview: "pending" | "in-progress" | "complete"
    compilingReport: "pending" | "in-progress" | "complete"
  }
  progress: {
    reviewersCompleted: number
    totalReviewers: number
  }
  slaStatus: "on-time" | "at-risk" | "delivered-early" | "delivered-late"
  deliveryTimeHours?: number
  estimatedDeliveryWindow?: string
}

// Seeded demo data with varied lifecycle states
export const mockJobs: Job[] = [
  {
    id: "job-1",
    title: "Product Demo Final Cut",
    fileName: "product-demo-v3.mp4",
    fileSize: 125.4,
    status: "UPLOADING",
    language: "English",
    uploadedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    slaHours: 48,
    guaranteedReviewers: 50,
    addons: {},
    timeline: {
      aiDiagnostics: "pending",
      humanReview: "pending",
      compilingReport: "pending",
    },
    progress: {
      reviewersCompleted: 0,
      totalReviewers: 50,
    },
    slaStatus: "on-time",
    estimatedDeliveryWindow: "24-48 hours",
  },
  {
    id: "job-2",
    title: "Tutorial Episode 12",
    fileName: "tutorial-ep12.mov",
    fileSize: 234.8,
    status: "PROCESSING",
    language: "English",
    uploadedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    slaHours: 72,
    guaranteedReviewers: 50,
    addons: {
      extraReviewers: 10,
    },
    timeline: {
      aiDiagnostics: "complete",
      humanReview: "pending",
      compilingReport: "pending",
    },
    progress: {
      reviewersCompleted: 0,
      totalReviewers: 60,
    },
    slaStatus: "on-time",
    estimatedDeliveryWindow: "48-72 hours",
  },
  {
    id: "job-3",
    title: "Marketing Pitch V2",
    fileName: "pitch-v2.mp4",
    fileSize: 89.2,
    status: "SEGMENTED",
    language: "Spanish",
    uploadedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    slaHours: 24,
    guaranteedReviewers: 50,
    addons: {
      fasterDelivery: true,
    },
    timeline: {
      aiDiagnostics: "complete",
      humanReview: "pending",
      compilingReport: "pending",
    },
    progress: {
      reviewersCompleted: 0,
      totalReviewers: 50,
    },
    slaStatus: "on-time",
    estimatedDeliveryWindow: "12-24 hours",
  },
  {
    id: "job-4",
    title: "Webinar Recording - Q4 Updates",
    fileName: "webinar-q4.mp4",
    fileSize: 456.7,
    status: "IN_REVIEW",
    language: "English",
    uploadedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    slaHours: 48,
    guaranteedReviewers: 50,
    addons: {
      extraReviewers: 25,
      fullWatchSummary: true,
    },
    timeline: {
      aiDiagnostics: "complete",
      humanReview: "in-progress",
      compilingReport: "pending",
    },
    progress: {
      reviewersCompleted: 38,
      totalReviewers: 75,
    },
    slaStatus: "on-time",
    estimatedDeliveryWindow: "18-24 hours remaining",
  },
  {
    id: "job-5",
    title: "Product Launch Announcement",
    fileName: "launch-announcement.mov",
    fileSize: 167.3,
    status: "IN_REVIEW",
    language: "Portuguese",
    uploadedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    slaHours: 72,
    guaranteedReviewers: 30,
    addons: {},
    timeline: {
      aiDiagnostics: "complete",
      humanReview: "in-progress",
      compilingReport: "pending",
    },
    progress: {
      reviewersCompleted: 22,
      totalReviewers: 30,
    },
    slaStatus: "at-risk",
    estimatedDeliveryWindow: "36-48 hours remaining",
  },
  {
    id: "job-6",
    title: "Educational Series Part 3",
    fileName: "education-pt3.mp4",
    fileSize: 312.5,
    status: "COMPILING",
    language: "English",
    uploadedAt: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
    slaHours: 48,
    guaranteedReviewers: 50,
    actualReviewers: 52,
    addons: {
      extraReviewers: 10,
    },
    timeline: {
      aiDiagnostics: "complete",
      humanReview: "complete",
      compilingReport: "in-progress",
    },
    progress: {
      reviewersCompleted: 52,
      totalReviewers: 52,
    },
    slaStatus: "on-time",
    estimatedDeliveryWindow: "2-4 hours",
  },
  {
    id: "job-7",
    title: "Company Culture Video",
    fileName: "culture-2024.mp4",
    fileSize: 198.4,
    status: "DELIVERED",
    language: "English",
    uploadedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    slaHours: 48,
    guaranteedReviewers: 50,
    actualReviewers: 53,
    addons: {},
    timeline: {
      aiDiagnostics: "complete",
      humanReview: "complete",
      compilingReport: "complete",
    },
    progress: {
      reviewersCompleted: 53,
      totalReviewers: 53,
    },
    slaStatus: "delivered-early",
    deliveryTimeHours: 26,
  },
  {
    id: "job-8",
    title: "Sales Training Module 5",
    fileName: "training-module-5.mp4",
    fileSize: 287.6,
    status: "DELIVERED",
    language: "Spanish",
    uploadedAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    slaHours: 72,
    guaranteedReviewers: 50,
    actualReviewers: 51,
    addons: {
      liveFeedback: true,
    },
    timeline: {
      aiDiagnostics: "complete",
      humanReview: "complete",
      compilingReport: "complete",
    },
    progress: {
      reviewersCompleted: 51,
      totalReviewers: 51,
    },
    slaStatus: "on-time",
    deliveryTimeHours: 72,
  },
  {
    id: "job-9",
    title: "Customer Testimonials Reel",
    fileName: "testimonials.mov",
    fileSize: 143.2,
    status: "DELIVERED",
    language: "English",
    uploadedAt: new Date(Date.now() - 168 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
    slaHours: 48,
    guaranteedReviewers: 50,
    actualReviewers: 48,
    addons: {
      fasterDelivery: true,
      extraReviewers: 10,
    },
    timeline: {
      aiDiagnostics: "complete",
      humanReview: "complete",
      compilingReport: "complete",
    },
    progress: {
      reviewersCompleted: 48,
      totalReviewers: 48,
    },
    slaStatus: "on-time",
    deliveryTimeHours: 48,
  },
  {
    id: "job-10",
    title: "Investor Update Presentation",
    fileName: "investor-update-dec.mp4",
    fileSize: 256.9,
    status: "DELIVERED",
    language: "English",
    uploadedAt: new Date(Date.now() - 240 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString(),
    slaHours: 72,
    guaranteedReviewers: 50,
    actualReviewers: 55,
    addons: {
      extraReviewers: 25,
      fullWatchSummary: true,
    },
    timeline: {
      aiDiagnostics: "complete",
      humanReview: "complete",
      compilingReport: "complete",
    },
    progress: {
      reviewersCompleted: 55,
      totalReviewers: 55,
    },
    slaStatus: "delivered-late",
    deliveryTimeHours: 96,
  },
]

export function getJobStatusLabel(status: JobStatus): string {
  const labels: Record<JobStatus, string> = {
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

export function getJobStatusHelperText(status: JobStatus): string {
  const helpers: Record<JobStatus, string> = {
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
