/**
 * API Types - Matches backend DTOs
 *
 * These types mirror the Spring Boot backend response structures.
 * Keep in sync with backend DTOs when making changes.
 */

// =============================================================================
// Core API Response Wrapper
// =============================================================================

/**
 * Standard API response wrapper used by all endpoints.
 * Matches backend's ApiResponse class.
 */
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: ApiError
  timestamp: string
}

/**
 * Error details returned in failed API responses.
 */
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// =============================================================================
// Authentication Types
// =============================================================================

/**
 * User roles in the system.
 */
export type UserRole = "CREATOR" | "REVIEWER" | "ADMIN"

/**
 * Basic user info returned with auth responses.
 * Matches AuthResponse.UserDto in backend.
 */
export interface UserDto {
  id: number
  email: string
  role: UserRole
  emailVerified: boolean
}

/**
 * Response from login/signup endpoints.
 * Refresh token is NOT included - it's set as HttpOnly cookie.
 */
export interface AccessTokenResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: UserDto
}

/**
 * Full user profile from GET /auth/me.
 * Matches UserProfileResponse in backend.
 */
export interface UserProfileResponse {
  id: number
  email: string
  role: UserRole
  emailVerified: boolean
  phoneNumber?: string
  country?: string
  timezone?: string
  tosAcceptedAt?: string
  marketingConsent?: boolean
  createdAt: string
  lastLoginAt?: string
  creatorProfile?: CreatorProfile
  reviewerProfile?: ReviewerProfile
  adminProfile?: AdminProfile
}

/**
 * Creator-specific profile data.
 */
export interface CreatorProfile {
  firstName: string
  lastName: string
  displayName: string
  company?: string
  profileImageUrl?: string
  bannerImageUrl?: string
  primaryLanguage?: string
  planTier?: string
  remainingCredits?: number
}

/**
 * Reviewer-specific profile data.
 */
export interface ReviewerProfile {
  firstName: string
  lastName: string
  displayName: string
  profileImageUrl?: string
  language: string
  proficiency?: string
  qualificationPassed: boolean
  qualityScore: number
  queueLocked: boolean
  tasksCompleted: number
  totalEarnings: number
  pendingEarnings: number
  payoutMethod?: string
}

/**
 * Admin-specific profile data.
 */
export interface AdminProfile {
  name: string
  permissions: string[]
}

// =============================================================================
// Admin Debug Types
// =============================================================================

export interface AdminDebugSampleResponse {
  jobId: number
  reportId: number | null
  taskIds: number[]
  creatorEmail: string
  reviewerEmail: string
}

export interface AdminDebugCompileResponse {
  jobId: number
  reportId: number
  status: string
}

export interface AdminDebugRequeueResponse {
  requeuedCount: number
}

// =============================================================================
// Auth Request Types
// =============================================================================

/**
 * Login request payload.
 */
export interface LoginRequest {
  email: string
  password: string
}

/**
 * Signup request payload.
 */
export interface SignUpRequest {
  email: string
  password: string
  role: UserRole
  firstName: string
  lastName: string
  phoneNumber?: string
  country: string
  timezone: string
  tosAccepted: boolean
  marketingConsent?: boolean
  preferredPayoutMethod?: 'PAYPAL' | 'BANK_TRANSFER' | 'STRIPE_CONNECT'
  company?: string
  language?: string
  proficiency?: string
}

// =============================================================================
// Error Classes
// =============================================================================

/**
 * Custom error class for API errors.
 * Thrown when API returns success: false.
 */
export class ApiRequestError extends Error {
  public readonly code: string
  public readonly details?: Record<string, unknown>
  public readonly status?: number

  constructor(error: ApiError, status?: number) {
    super(error.message)
    this.name = "ApiRequestError"
    this.code = error.code
    this.details = error.details
    this.status = status
  }
}

/**
 * Error class for authentication failures.
 * Thrown when refresh fails and user must re-authenticate.
 */
export class AuthenticationError extends Error {
  constructor(message: string = "Authentication required") {
    super(message)
    this.name = "AuthenticationError"
  }
}

// =============================================================================
// Job Types (Creator Dashboard)
// =============================================================================

export type JobStatus =
  | "UPLOADING"
  | "UPLOADED"
  | "PROCESSING"
  | "SEGMENTED"
  | "IN_REVIEW"
  | "COMPILING"
  | "DELIVERED"

export type SlaStatus = "on-time" | "at-risk" | "delivered-early" | "delivered-late"

export interface JobDto {
  id: number
  videoId: number
  videoTitle: string
  fileName: string
  fileSize: number
  status: JobStatus
  language: string
  slaHours: number
  requiredReviewers: number
  completedReviewers: number
  totalReviewers: number
  extraReviewers?: number
  fasterDelivery: boolean
  fullWatchSummary: boolean
  liveFeedback: boolean
  timeline: {
    aiDiagnostics: "pending" | "complete"
    humanReview: "pending" | "in-progress" | "complete"
    compilingReport: "pending" | "in-progress" | "complete"
  }
  progress: {
    reviewersCompleted: number
    totalReviewers: number
  }
  slaStatus: SlaStatus
  deliveryTimeHours?: number
  estimatedDeliveryWindow?: string
  createdAt: string
  deliveredAt?: string
}

// =============================================================================
// Report Types (Creator Dashboard)
// =============================================================================

export type ReportStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED"

export interface ReportDto {
  id: number
  videoTitle: string
  duration?: string
  videoDurationMinutes?: number
  languagePool: string
  status: ReportStatus
  guaranteedReviewers: number
  slaWindow?: string
  actualDeliveryTime?: string
  dateSubmitted: string
  dateCompleted?: string
  aiComplete: boolean
  humanComplete: boolean
  compiled: boolean
  clarityScore?: number
  pacingScore?: number
  engagementScore?: number
  structureScore?: number
  executiveSummary?: string
  timelineInsights?: Array<{
    timestamp: string
    observation: string
    severity: string
    category: string
  }>
  aiAnalysis?: {
    monologueStretches?: number
    silenceDowntime?: number
    topicDrift?: number
    energyVariance?: number
  }
  humanReviews?: {
    engagementStats?: Record<string, number>
    comments?: string[]
  }
  actionPlan?: Array<{
    action: string
    why: string
    expectedResult: string
  }>
}

// =============================================================================
// Task Types (Reviewer Dashboard)
// =============================================================================

export type TaskStatus =
  | "AVAILABLE"
  | "LEASED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "QC_PENDING"
  | "APPROVED"
  | "REJECTED"
  | "REQUEUED"

export interface TaskQuestion {
  id: string
  question: string
  type: "scale" | "choice" | "text" | "attention-check"
  options?: string[]
}

export interface TaskDto {
  id: number
  status: TaskStatus
  language: string
  segmentTimestamp?: string
  segmentDurationSeconds: number
  payAmount: number
  videoSegmentUrl?: string
  questions: TaskQuestion[]
  attentionCheckIndex?: number
  leaseExpiresAt?: string
  submittedAt?: string
  reviewedAt?: string
  rejectionReason?: string
  createdAt: string
}

// =============================================================================
// Earnings Types (Reviewer Dashboard)
// =============================================================================

export interface EarningsBreakdown {
  date: string
  tasksCompleted: number
  amount: number
}

export interface EarningsResponse {
  totalEarnings: number
  pendingEarnings: number
  availableForPayout: number
  tasksCompletedThisMonth: number
  earningsThisMonth: number
  recentEarnings: EarningsBreakdown[]
}

// =============================================================================
// Admin Types
// =============================================================================

export interface KpiResponse {
  totalCreators: number
  totalReviewers: number
  activeReviewers: number
  pendingTasks: number
  tasksCompletedToday: number
  jobsInProgress: number
  jobsDeliveredToday: number
  avgDeliveryTimeHours: number
  slaComplianceRate: number
  // Additional fields for admin dashboard
  uploadsToday: number
  segmentsToReview: number
  reportsDelivered: number
  slaMissCount: number
  slaMissRate: number
  reviewFailureRate: number
  rejectedSubmissions: number
}

export interface LanguagePoolCapacity {
  id: number
  name: string
  code: string
  capacityScore: number
  currentSLA: string
  maxReviewersPerVideo: number
  checkoutEnabled: boolean
  liveAddOnEnabled: boolean
  activeReviewers: number
  pendingTasks: number
  avgDeliveryTime: string
}

export interface CapacityResponse {
  languagePools: LanguagePoolCapacity[]
}

// =============================================================================
// Report Comparison Types
// =============================================================================

export interface ReportCompareResponse {
  leftReport: ReportDto
  rightReport: ReportDto
}
