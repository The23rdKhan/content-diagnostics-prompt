"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"
import { api } from "@/lib/api"
import type { CreatorEmailPreferences, ReviewerEmailPreferences } from "@/lib/email-preferences"

export type EmailPreferences = CreatorEmailPreferences | ReviewerEmailPreferences

/**
 * Hook to fetch and update email preferences.
 */
export function useEmailPreferences<T extends EmailPreferences>() {
  const { data, loading: fetchLoading, error: fetchError, refetch } = useApi<T>("/settings/email-prefs")

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<Error | null>(null)

  const updatePreferences = useCallback(async (preferences: T): Promise<T> => {
    setSaving(true)
    setSaveError(null)

    try {
      const result = await api.put<T>("/settings/email-prefs", preferences)
      await refetch()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to save preferences")
      setSaveError(error)
      throw error
    } finally {
      setSaving(false)
    }
  }, [refetch])

  return {
    preferences: data,
    loading: fetchLoading,
    error: fetchError,
    saving,
    saveError,
    updatePreferences,
    refetch,
  }
}
