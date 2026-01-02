"use client"

import { logError } from "@/lib/error-tracking"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { trackEvent } from "@/lib/analytics"
import Link from "next/link"
import { Mail, Save, AlertCircle, RefreshCw } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useEmailPreferences } from "@/lib/hooks/use-settings"
import { defaultReviewerEmailPreferences, type ReviewerEmailPreferences } from "@/lib/email-preferences"

export default function ReviewerEmailPreferencesPage() {
  const {
    preferences: apiPreferences,
    loading,
    error,
    saving,
    saveError,
    updatePreferences,
    refetch,
  } = useEmailPreferences<ReviewerEmailPreferences>()

  const [localPrefs, setLocalPrefs] = useState<ReviewerEmailPreferences>(defaultReviewerEmailPreferences)
  const [hasChanges, setHasChanges] = useState(false)
  const [saved, setSaved] = useState(false)

  // Sync API preferences to local state
  useEffect(() => {
    if (apiPreferences) {
      setLocalPrefs(apiPreferences)
      setHasChanges(false)
    }
  }, [apiPreferences])

  const handleToggle = (key: keyof ReviewerEmailPreferences) => {
    setLocalPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
    setHasChanges(true)
    setSaved(false)
  }

  const handleSave = async () => {
    try {
      await updatePreferences(localPrefs)
      trackEvent("email_pref_updated", { role: "reviewer", preferences: localPrefs })
      setSaved(true)
      setHasChanges(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      logError("Failed to save preferences", err)
    }
  }

  // Error state
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
            <Link href="/reviewers/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Dashboard
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <div className="rounded-xl border border-destructive bg-destructive/5 p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-xl font-bold text-destructive">Failed to Load Preferences</h2>
            <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
            <Button className="mt-4" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/reviewers/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Mail className="h-6 w-6 text-accent" />
          <h1 className="text-2xl font-bold">Email Notification Preferences</h1>
        </div>

        <Card className="p-6">
          <p className="mb-6 text-sm text-muted-foreground">
            Control which email notifications you receive. You can manage these settings at any time.
          </p>

          {loading ? (
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-6 w-11 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium">Qualification Result</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive notification when you pass or fail the qualification task.
                  </p>
                </div>
                <Switch
                  checked={localPrefs.qualificationResult}
                  onCheckedChange={() => handleToggle("qualificationResult")}
                />
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium">Task Approved/Rejected</h3>
                  <p className="text-sm text-muted-foreground">
                    Get notified when your submitted tasks are approved or rejected after quality control.
                  </p>
                </div>
                <Switch
                  checked={localPrefs.taskApprovedRejected}
                  onCheckedChange={() => handleToggle("taskApprovedRejected")}
                />
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium">Payout Processed</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive confirmation when your payout is released to your payment method.
                  </p>
                </div>
                <Switch checked={localPrefs.payoutProcessed} onCheckedChange={() => handleToggle("payoutProcessed")} />
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium">Policy Updates</h3>
                  <p className="text-sm text-muted-foreground">
                    Stay informed about updates to reviewer guidelines and platform policies.
                  </p>
                </div>
                <Switch checked={localPrefs.policyUpdates} onCheckedChange={() => handleToggle("policyUpdates")} />
              </div>
            </div>
          )}

          {saveError && (
            <div className="mt-4 rounded-lg bg-destructive/10 border border-destructive/30 p-3">
              <p className="text-sm text-destructive">{saveError.message}</p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Critical account notifications (quality warnings, etc.) will always be sent.
            </p>
            <Button onClick={handleSave} disabled={saving || saved || !hasChanges || loading}>
              {saving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {saved ? "Saved!" : "Save Preferences"}
                </>
              )}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}
