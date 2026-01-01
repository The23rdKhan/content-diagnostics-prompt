"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { trackEvent } from "@/lib/analytics"
import Link from "next/link"
import { Mail, Save } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { defaultReviewerEmailPreferences, type ReviewerEmailPreferences } from "@/lib/email-preferences"

export default function ReviewerEmailPreferencesPage() {
  const [preferences, setPreferences] = useState<ReviewerEmailPreferences>(defaultReviewerEmailPreferences)
  const [saved, setSaved] = useState(false)

  const handleToggle = (key: keyof ReviewerEmailPreferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }))
    setSaved(false)
  }

  const handleSave = () => {
    trackEvent("email_pref_updated", { role: "reviewer", preferences })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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

          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-medium">Qualification Result</h3>
                <p className="text-sm text-muted-foreground">
                  Receive notification when you pass or fail the qualification task.
                </p>
              </div>
              <Switch
                checked={preferences.qualificationResult}
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
                checked={preferences.taskApprovedRejected}
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
              <Switch checked={preferences.payoutProcessed} onCheckedChange={() => handleToggle("payoutProcessed")} />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-medium">Policy Updates</h3>
                <p className="text-sm text-muted-foreground">
                  Stay informed about updates to reviewer guidelines and platform policies.
                </p>
              </div>
              <Switch checked={preferences.policyUpdates} onCheckedChange={() => handleToggle("policyUpdates")} />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Critical account notifications (quality warnings, etc.) will always be sent.
            </p>
            <Button onClick={handleSave} disabled={saved}>
              <Save className="mr-2 h-4 w-4" />
              {saved ? "Saved!" : "Save Preferences"}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}
