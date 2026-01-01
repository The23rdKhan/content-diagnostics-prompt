// Mock data for admin operations console

export interface LanguagePool {
  id: string
  name: string
  code: string
  capacityScore: number // 0-100
  currentSLA: string
  maxReviewersPerVideo: number
  checkoutEnabled: boolean
  liveAddOnEnabled: boolean
  activeReviewers: number
  tasksToday: number
  avgDeliveryTime: string
}

export interface Task {
  id: string
  videoId: string
  segmentTimestamp: string
  language: string
  pay: number
  status: "pending" | "leased" | "submitted" | "approved" | "rejected" | "requeued"
  leaseExpiry?: string
  reviewerId?: string
  createdAt: string
}

export interface Reviewer {
  id: string
  name: string
  email: string
  languages: string[]
  qualificationStatus: "pending" | "passed" | "failed"
  qualityScore: number // 0-100
  completionRate: number // 0-100
  strikes: number
  status: "active" | "disabled" | "warned"
  tasksCompleted: number
  approvalRate: number
  joinedAt: string
}

export interface Payout {
  id: string
  reviewerId: string
  reviewerName: string
  amount: number
  tasksIncluded: number
  holdStatus: "pending" | "qc" | "ready" | "released"
  createdAt: string
  releasedAt?: string
}

export interface Creator {
  id: string
  name: string
  email: string
  planTier: "basic" | "professional" | "enterprise"
  uploadsThisMonth: number
  slaIssues: number
  creditsIssued: number
  joinedAt: string
}

// Mock language pools
export const languagePools: LanguagePool[] = [
  {
    id: "1",
    name: "English (Global)",
    code: "en",
    capacityScore: 85,
    currentSLA: "24h",
    maxReviewersPerVideo: 5,
    checkoutEnabled: true,
    liveAddOnEnabled: true,
    activeReviewers: 127,
    tasksToday: 342,
    avgDeliveryTime: "18h",
  },
  {
    id: "2",
    name: "Spanish (LATAM)",
    code: "es-latam",
    capacityScore: 42,
    currentSLA: "36h",
    maxReviewersPerVideo: 3,
    checkoutEnabled: true,
    liveAddOnEnabled: false,
    activeReviewers: 34,
    tasksToday: 89,
    avgDeliveryTime: "28h",
  },
  {
    id: "3",
    name: "Portuguese (Brazil)",
    code: "pt-br",
    capacityScore: 38,
    currentSLA: "48h",
    maxReviewersPerVideo: 3,
    checkoutEnabled: false,
    liveAddOnEnabled: false,
    activeReviewers: 21,
    tasksToday: 45,
    avgDeliveryTime: "42h",
  },
  {
    id: "4",
    name: "French (Global)",
    code: "fr",
    capacityScore: 67,
    currentSLA: "24h",
    maxReviewersPerVideo: 4,
    checkoutEnabled: true,
    liveAddOnEnabled: true,
    activeReviewers: 56,
    tasksToday: 134,
    avgDeliveryTime: "22h",
  },
  {
    id: "5",
    name: "German",
    code: "de",
    capacityScore: 71,
    currentSLA: "24h",
    maxReviewersPerVideo: 4,
    checkoutEnabled: true,
    liveAddOnEnabled: true,
    activeReviewers: 48,
    tasksToday: 112,
    avgDeliveryTime: "20h",
  },
]

// Mock tasks
export const tasks: Task[] = [
  {
    id: "task-1",
    videoId: "vid-4829",
    segmentTimestamp: "0:00-2:30",
    language: "English (Global)",
    pay: 12,
    status: "leased",
    leaseExpiry: "2026-01-01T14:30:00Z",
    reviewerId: "rev-101",
    createdAt: "2026-01-01T12:00:00Z",
  },
  {
    id: "task-2",
    videoId: "vid-4830",
    segmentTimestamp: "0:00-3:15",
    language: "Spanish (LATAM)",
    pay: 15,
    status: "pending",
    createdAt: "2026-01-01T11:45:00Z",
  },
  {
    id: "task-3",
    videoId: "vid-4831",
    segmentTimestamp: "2:30-5:00",
    language: "English (Global)",
    pay: 12,
    status: "submitted",
    reviewerId: "rev-102",
    createdAt: "2026-01-01T10:30:00Z",
  },
  {
    id: "task-4",
    videoId: "vid-4832",
    segmentTimestamp: "0:00-4:20",
    language: "Portuguese (Brazil)",
    pay: 18,
    status: "approved",
    reviewerId: "rev-103",
    createdAt: "2026-01-01T09:00:00Z",
  },
  {
    id: "task-5",
    videoId: "vid-4833",
    segmentTimestamp: "0:00-1:45",
    language: "French (Global)",
    pay: 10,
    status: "rejected",
    reviewerId: "rev-104",
    createdAt: "2026-01-01T08:15:00Z",
  },
]

// Mock reviewers
export const reviewers: Reviewer[] = [
  {
    id: "rev-101",
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    languages: ["English (Global)", "Mandarin"],
    qualificationStatus: "passed",
    qualityScore: 94,
    completionRate: 97,
    strikes: 0,
    status: "active",
    tasksCompleted: 342,
    approvalRate: 96,
    joinedAt: "2025-11-15",
  },
  {
    id: "rev-102",
    name: "Carlos Rodriguez",
    email: "carlos.r@example.com",
    languages: ["Spanish (LATAM)", "English (Global)"],
    qualificationStatus: "passed",
    qualityScore: 88,
    completionRate: 92,
    strikes: 1,
    status: "warned",
    tasksCompleted: 187,
    approvalRate: 89,
    joinedAt: "2025-12-01",
  },
  {
    id: "rev-103",
    name: "Maria Silva",
    email: "maria.silva@example.com",
    languages: ["Portuguese (Brazil)", "Spanish (LATAM)"],
    qualificationStatus: "passed",
    qualityScore: 91,
    completionRate: 95,
    strikes: 0,
    status: "active",
    tasksCompleted: 256,
    approvalRate: 93,
    joinedAt: "2025-10-20",
  },
  {
    id: "rev-104",
    name: "Jean Dupont",
    email: "jean.d@example.com",
    languages: ["French (Global)", "English (Global)"],
    qualificationStatus: "passed",
    qualityScore: 76,
    completionRate: 84,
    strikes: 2,
    status: "disabled",
    tasksCompleted: 98,
    approvalRate: 78,
    joinedAt: "2025-12-10",
  },
]

// Mock payouts
export const payouts: Payout[] = [
  {
    id: "pay-1",
    reviewerId: "rev-101",
    reviewerName: "Sarah Chen",
    amount: 487.5,
    tasksIncluded: 42,
    holdStatus: "ready",
    createdAt: "2025-12-28",
  },
  {
    id: "pay-2",
    reviewerId: "rev-102",
    reviewerName: "Carlos Rodriguez",
    amount: 312.0,
    tasksIncluded: 26,
    holdStatus: "qc",
    createdAt: "2025-12-29",
  },
  {
    id: "pay-3",
    reviewerId: "rev-103",
    reviewerName: "Maria Silva",
    amount: 568.5,
    tasksIncluded: 38,
    holdStatus: "pending",
    createdAt: "2025-12-30",
  },
]

// Mock creators
export const creators: Creator[] = [
  {
    id: "cr-1",
    name: "TechTalk Studios",
    email: "contact@techtalk.com",
    planTier: "enterprise",
    uploadsThisMonth: 47,
    slaIssues: 0,
    creditsIssued: 0,
    joinedAt: "2025-09-15",
  },
  {
    id: "cr-2",
    name: "Fitness Forward",
    email: "admin@fitnessforward.com",
    planTier: "professional",
    uploadsThisMonth: 22,
    slaIssues: 2,
    creditsIssued: 1,
    joinedAt: "2025-10-22",
  },
  {
    id: "cr-3",
    name: "Cooking Chronicles",
    email: "hello@cookingchronicles.com",
    planTier: "basic",
    uploadsThisMonth: 8,
    slaIssues: 0,
    creditsIssued: 0,
    joinedAt: "2025-12-01",
  },
]
