import { logError } from "@/lib/error-tracking"
/**
 * In-Memory Auth Store
 *
 * Stores access token and user state in memory only (NOT localStorage).
 * This is more secure as tokens are not persisted and cannot be accessed by XSS.
 *
 * The refresh token is stored in an HttpOnly cookie by the backend,
 * so it's automatically sent with requests to /api/auth endpoints.
 *
 * On page refresh, the session is bootstrapped by:
 * 1. Calling POST /auth/refresh (cookie sent automatically)
 * 2. If successful, storing new access token in memory
 * 3. Calling GET /auth/me to get user profile
 */

import type { UserDto, AccessTokenResponse, ApiResponse } from "./types/api"

/**
 * Auth state shape.
 */
export interface AuthState {
  accessToken: string | null
  user: UserDto | null
  isAuthenticated: boolean
  isLoading: boolean
}

/**
 * Listener function for state changes.
 */
type AuthListener = (state: AuthState) => void

/**
 * Singleton auth store class.
 * Manages access token and user state in memory.
 */
class AuthStore {
  private accessToken: string | null = null
  private user: UserDto | null = null
  private isLoading: boolean = true
  private listeners: Set<AuthListener> = new Set()
  private refreshPromise: Promise<boolean> | null = null

  /**
   * Get the current access token.
   */
  getAccessToken(): string | null {
    return this.accessToken
  }

  /**
   * Get the current user.
   */
  getUser(): UserDto | null {
    return this.user
  }

  /**
   * Check if user is authenticated.
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null && this.user !== null
  }

  /**
   * Get current loading state.
   */
  getIsLoading(): boolean {
    return this.isLoading
  }

  /**
   * Get full auth state.
   */
  getState(): AuthState {
    return {
      accessToken: this.accessToken,
      user: this.user,
      isAuthenticated: this.isAuthenticated(),
      isLoading: this.isLoading,
    }
  }

  /**
   * Set auth state after successful login/signup.
   */
  setAuth(accessToken: string, user: UserDto): void {
    this.accessToken = accessToken
    this.user = user
    this.isLoading = false
    this.notifyListeners()
  }

  /**
   * Update just the access token (after refresh).
   */
  setAccessToken(accessToken: string): void {
    this.accessToken = accessToken
    this.notifyListeners()
  }

  /**
   * Update user info.
   */
  setUser(user: UserDto): void {
    this.user = user
    this.notifyListeners()
  }

  /**
   * Set loading state.
   */
  setLoading(loading: boolean): void {
    this.isLoading = loading
    this.notifyListeners()
  }

  /**
   * Clear all auth state (logout).
   */
  clear(): void {
    this.accessToken = null
    this.user = null
    this.isLoading = false
    this.notifyListeners()
  }

  /**
   * Attempt to refresh the access token.
   * Uses the HttpOnly refresh token cookie automatically.
   *
   * Returns true if refresh succeeded, false otherwise.
   * Uses a mutex to prevent concurrent refresh attempts.
   */
  async refresh(): Promise<boolean> {
    // If already refreshing, wait for that to complete
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this.doRefresh()

    try {
      return await this.refreshPromise
    } finally {
      this.refreshPromise = null
    }
  }

  private async doRefresh(): Promise<boolean> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"

    try {
      const response = await fetch(`${baseUrl}/auth/refresh`, {
        method: "POST",
        credentials: "include", // Sends HttpOnly cookie automatically
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        return false
      }

      const json: ApiResponse<AccessTokenResponse> = await response.json()

      if (json.success && json.data?.accessToken) {
        this.accessToken = json.data.accessToken
        if (json.data.user) {
          this.user = json.data.user
        }
        this.notifyListeners()
        return true
      }

      return false
    } catch (err) {
      logError("Token refresh failed", err)
      return false
    }
  }

  /**
   * Subscribe to auth state changes.
   * Returns an unsubscribe function.
   */
  subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener)

    // Immediately notify with current state
    listener(this.getState())

    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Notify all listeners of state change.
   */
  private notifyListeners(): void {
    const state = this.getState()
    this.listeners.forEach((listener) => listener(state))
  }
}

/**
 * Singleton instance of the auth store.
 */
export const authStore = new AuthStore()
