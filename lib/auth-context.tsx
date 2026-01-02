"use client"

/**
 * Auth Context
 *
 * Provides authentication state and methods to the app.
 * Uses real backend API with HttpOnly cookie-based refresh tokens.
 *
 * Features:
 * - Session bootstrap on mount (restores session after page refresh)
 * - Real API calls for signIn/signUp/signOut
 * - In-memory token storage (no localStorage)
 * - Automatic token refresh via authStore
 */

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { api, ApiRequestError } from "./api"
import { authStore } from "./authStore"
import type {
  UserRole,
  UserProfileResponse,
  AccessTokenResponse,
  LoginRequest,
  SignUpRequest,
} from "./types/api"

// =============================================================================
// Types
// =============================================================================

/**
 * User type for the frontend.
 * Mapped from UserProfileResponse for component consumption.
 */
export interface User {
  id: string
  email: string
  role: UserRole
  phoneNumber?: string
  country?: string
  timezone?: string
  creatorProfile?: {
    firstName: string
    lastName: string
    displayName: string
    company?: string
    profileImage?: string
    bannerImage?: string
    planTier?: string
    remainingCredits?: number
  }
  reviewerProfile?: {
    firstName: string
    lastName: string
    displayName: string
    profileImage?: string
    languages: string[]
    qualificationPassed: boolean
    totalEarnings?: number
    pendingEarnings?: number
  }
  adminProfile?: {
    name: string
    permissions: string[]
  }
}

/**
 * Sign up data for new user registration.
 */
export interface SignUpData {
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
}

/**
 * Re-export UserRole for convenience.
 */
export type { UserRole }

/**
 * Auth context value shape.
 */
interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (data: SignUpData) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
}

// =============================================================================
// Context
// =============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Maps backend UserProfileResponse to frontend User type.
 */
function mapProfileToUser(profile: UserProfileResponse): User {
  return {
    id: profile.id.toString(),
    email: profile.email,
    role: profile.role,
    phoneNumber: profile.phoneNumber,
    country: profile.country,
    timezone: profile.timezone,
    ...(profile.creatorProfile && {
      creatorProfile: {
        firstName: profile.creatorProfile.firstName,
        lastName: profile.creatorProfile.lastName,
        displayName: profile.creatorProfile.displayName,
        company: profile.creatorProfile.company,
        profileImage: profile.creatorProfile.profileImageUrl,
        bannerImage: profile.creatorProfile.bannerImageUrl,
        planTier: profile.creatorProfile.planTier,
        remainingCredits: profile.creatorProfile.remainingCredits,
      },
    }),
    ...(profile.reviewerProfile && {
      reviewerProfile: {
        firstName: profile.reviewerProfile.firstName,
        lastName: profile.reviewerProfile.lastName,
        displayName: profile.reviewerProfile.displayName,
        profileImage: profile.reviewerProfile.profileImageUrl,
        languages: [profile.reviewerProfile.language],
        qualificationPassed: profile.reviewerProfile.qualificationPassed,
        totalEarnings: profile.reviewerProfile.totalEarnings,
        pendingEarnings: profile.reviewerProfile.pendingEarnings,
      },
    }),
    ...(profile.adminProfile && {
      adminProfile: {
        name: profile.adminProfile.name,
        permissions: profile.adminProfile.permissions,
      },
    }),
  }
}

// =============================================================================
// Provider
// =============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  /**
   * Bootstrap session on mount.
   * Attempts to restore session using refresh token cookie.
   */
  useEffect(() => {
    let mounted = true

    async function bootstrap() {
      try {
        // First, try to refresh the token (uses HttpOnly cookie)
        const refreshed = await authStore.refresh()

        if (!refreshed) {
          // No valid session
          if (mounted) {
            setLoading(false)
          }
          return
        }

        // Fetch user profile
        const profile = await api.get<UserProfileResponse>("/auth/me")
        const mappedUser = mapProfileToUser(profile)

        if (mounted) {
          setUser(mappedUser)
          authStore.setUser({
            id: profile.id,
            email: profile.email,
            role: profile.role,
            emailVerified: profile.emailVerified,
          })
        }
      } catch (err) {
        // Session restoration failed - user needs to sign in
        console.error("Session bootstrap failed:", err)
        authStore.clear()
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    bootstrap()

    return () => {
      mounted = false
    }
  }, [])

  /**
   * Subscribe to auth store changes.
   * Updates loading state when auth store changes.
   */
  useEffect(() => {
    return authStore.subscribe((state) => {
      // Sync loading state from auth store
      if (!state.isLoading) {
        setLoading(false)
      }
    })
  }, [])

  /**
   * Sign up a new user.
   */
  const signUp = useCallback(
    async (data: SignUpData) => {
      const request: SignUpRequest = {
        email: data.email,
        password: data.password,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        country: data.country,
        timezone: data.timezone,
        tosAccepted: data.tosAccepted,
        marketingConsent: data.marketingConsent,
        preferredPayoutMethod: data.preferredPayoutMethod,
      }

      // Call signup API
      const response = await api.post<AccessTokenResponse>("/auth/signup", request)

      // Store access token
      authStore.setAuth(response.accessToken, response.user)

      // Fetch full profile
      const profile = await api.get<UserProfileResponse>("/auth/me")
      const mappedUser = mapProfileToUser(profile)

      setUser(mappedUser)
    },
    []
  )

  /**
   * Sign in an existing user.
   */
  const signIn = useCallback(async (email: string, password: string) => {
    const request: LoginRequest = { email, password }

    // Call login API
    const response = await api.post<AccessTokenResponse>("/auth/login", request)

    // Store access token
    authStore.setAuth(response.accessToken, response.user)

    // Fetch full profile
    const profile = await api.get<UserProfileResponse>("/auth/me")
    const mappedUser = mapProfileToUser(profile)

    setUser(mappedUser)
  }, [])

  /**
   * Sign out the current user.
   */
  const signOut = useCallback(async () => {
    try {
      // Call logout API (clears cookie server-side)
      await api.post<void>("/auth/logout")
    } catch {
      // Ignore errors - we're logging out anyway
    } finally {
      // Clear local state
      authStore.clear()
      setUser(null)
    }
  }, [])

  /**
   * Refresh user data from the server.
   * Call this after updating profile to sync the auth context.
   */
  const refreshUser = useCallback(async () => {
    try {
      const profile = await api.get<UserProfileResponse>("/auth/me")
      const mappedUser = mapProfileToUser(profile)
      setUser(mappedUser)
    } catch (err) {
      console.error("Failed to refresh user:", err)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to access auth context.
 * Must be used within AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

/**
 * Re-export ApiRequestError for error handling in components.
 */
export { ApiRequestError }
