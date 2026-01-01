/**
 * API Client
 *
 * Centralized fetch wrapper with:
 * - Base URL configuration
 * - Automatic auth header injection
 * - HttpOnly cookie support (credentials: include)
 * - Automatic token refresh on 401
 * - Consistent error handling
 *
 * Usage:
 *   const user = await api.get<UserProfileResponse>('/auth/me')
 *   const data = await api.post<AccessTokenResponse>('/auth/login', { email, password })
 */

import { authStore } from "./authStore"
import { ApiRequestError, AuthenticationError, type ApiResponse } from "./types/api"

/**
 * Base URL for API requests.
 * Set via NEXT_PUBLIC_API_BASE_URL environment variable.
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"

/**
 * Extended request options with retry flag.
 */
interface ApiRequestOptions extends RequestInit {
  _retried?: boolean
  _networkRetried?: boolean
}

const RETRYABLE_STATUS_CODES = new Set([502, 503, 504])

/**
 * Core fetch function with auth handling.
 *
 * @param path - API endpoint path (e.g., '/auth/me')
 * @param options - Fetch options
 * @returns Parsed response data
 * @throws ApiRequestError on API errors
 * @throws AuthenticationError when auth fails and refresh fails
 */
async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const accessToken = authStore.getAccessToken()
  const method = (options.method || "GET").toUpperCase()
  const shouldRetryNetwork = method === "GET"

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  }

  // Add auth header if we have a token
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`
  }

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      credentials: "include", // Send HttpOnly cookies
      headers,
    })
  } catch (err) {
    if (shouldRetryNetwork && !options._networkRetried) {
      await new Promise((resolve) => setTimeout(resolve, 250))
      return request<T>(path, { ...options, _networkRetried: true })
    }
    throw err
  }

  if (shouldRetryNetwork && !options._networkRetried && RETRYABLE_STATUS_CODES.has(response.status)) {
    await new Promise((resolve) => setTimeout(resolve, 250))
    return request<T>(path, { ...options, _networkRetried: true })
  }

  // Handle 401 Unauthorized - try refresh once
  if (response.status === 401 && !options._retried) {
    const refreshed = await authStore.refresh()

    if (refreshed) {
      // Retry the original request with new token
      return request<T>(path, { ...options, _retried: true })
    }

    // Refresh failed - clear state and throw
    authStore.clear()
    if (typeof window !== "undefined") {
      window.location.assign("/auth/sign-in?reason=session-expired")
    }
    throw new AuthenticationError("Session expired. Please sign in again.")
  }

  if (response.status === 401) {
    authStore.clear()
    if (typeof window !== "undefined") {
      window.location.assign("/auth/sign-in?reason=session-expired")
    }
    throw new AuthenticationError("Session expired. Please sign in again.")
  }

  if (response.status === 403) {
    throw new ApiRequestError(
      {
        code: "FORBIDDEN",
        message: "Access denied.",
      },
      response.status
    )
  }

  // Parse response
  let json: ApiResponse<T>
  try {
    json = await response.json()
  } catch {
    throw new ApiRequestError(
      {
        code: "PARSE_ERROR",
        message: "Failed to parse server response",
      },
      response.status
    )
  }

  // Handle API error responses
  if (!json.success) {
    throw new ApiRequestError(
      json.error || {
        code: "UNKNOWN_ERROR",
        message: "An unknown error occurred",
      },
      response.status
    )
  }

  // Return the data (validate it exists for type safety)
  if (json.data === undefined) {
    throw new ApiRequestError(
      {
        code: "MISSING_DATA",
        message: "Server response missing expected data",
      },
      response.status
    )
  }

  return json.data
}

/**
 * API client with typed methods.
 */
export const api = {
  /**
   * GET request.
   *
   * @param path - API endpoint
   * @returns Response data
   */
  get: <T>(path: string): Promise<T> => {
    return request<T>(path, { method: "GET" })
  },

  /**
   * POST request.
   *
   * @param path - API endpoint
   * @param body - Request body (will be JSON stringified)
   * @returns Response data
   */
  post: <T>(path: string, body?: unknown): Promise<T> => {
    return request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    })
  },

  /**
   * PUT request.
   *
   * @param path - API endpoint
   * @param body - Request body (will be JSON stringified)
   * @returns Response data
   */
  put: <T>(path: string, body?: unknown): Promise<T> => {
    return request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    })
  },

  /**
   * PATCH request.
   *
   * @param path - API endpoint
   * @param body - Request body (will be JSON stringified)
   * @returns Response data
   */
  patch: <T>(path: string, body?: unknown): Promise<T> => {
    return request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    })
  },

  /**
   * DELETE request.
   *
   * @param path - API endpoint
   * @returns Response data
   */
  delete: <T>(path: string): Promise<T> => {
    return request<T>(path, { method: "DELETE" })
  },
}

/**
 * Re-export error types for convenience.
 */
export { ApiRequestError, AuthenticationError }
