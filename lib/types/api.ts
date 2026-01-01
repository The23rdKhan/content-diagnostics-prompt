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
  name: string
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
  name: string
  profileImageUrl?: string
  language: string
  proficiency?: string
  qualificationPassed: boolean
  qualityScore: number
  queueLocked: boolean
  tasksCompleted: number
  totalEarnings: number
}

/**
 * Admin-specific profile data.
 */
export interface AdminProfile {
  name: string
  permissions: string[]
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
  name: string
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

  constructor(error: ApiError) {
    super(error.message)
    this.name = "ApiRequestError"
    this.code = error.code
    this.details = error.details
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
