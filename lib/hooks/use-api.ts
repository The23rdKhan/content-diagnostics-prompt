"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"

interface UseApiOptions {
  enabled?: boolean
}

interface UseApiResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Generic hook for fetching data from the API.
 *
 * @param path - API endpoint path (e.g., '/creator/jobs')
 * @param options - Configuration options
 * @returns Object with data, loading, error, and refetch function
 */
export function useApi<T>(
  path: string,
  options: UseApiOptions = {}
): UseApiResult<T> {
  const { enabled = true } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const result = await api.get<T>(path)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"))
    } finally {
      setLoading(false)
    }
  }, [path, enabled])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

/**
 * Hook for making POST requests.
 */
export function useApiMutation<TData, TVariables = unknown>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = useCallback(
    async (path: string, variables?: TVariables): Promise<TData> => {
      setLoading(true)
      setError(null)

      try {
        const result = await api.post<TData>(path, variables)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error")
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    mutate,
    loading,
    error,
  }
}
