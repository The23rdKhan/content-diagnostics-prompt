"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { trackEvent } from "@/lib/analytics"
import Link from "next/link"
import { Mail, Save } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { defaultCreatorEmailPreferences, type CreatorEmailPreferences } from "@/lib/email-preferences"

export default function CreatorEmailPreferencesPage() {
  const [preferences, setPreferences] = useState<CreatorEmailPreferences>(defaultCreatorEmailPreferences)
  const [saved, setSaved] = useState(false)

  const handleToggle = (key: keyof CreatorEmailPreferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }))
    setSaved(false)
  }

  const handleSave = () => {
    trackEvent("email_pref_updated", { role: "creator", preferences })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/creators/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
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
                <h3 className="font-medium">Upload Received</h3>
                <p className="text-sm text-muted-foreground">
                  Get notified when your video upload is confirmed and processing begins.
                </p>
              </div>
              <Switch checked={preferences.uploadReceived} onCheckedChange={() => handleToggle("uploadReceived")} />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-medium">AI Diagnostics Ready</h3>
                <p className="text-sm text-muted-foreground">
                  Receive updates when AI analysis completes (optional, as reports include full AI data).
                </p>
              </div>
              <Switch
                checked={preferences.aiDiagnosticsReady}
                onCheckedChange={() => handleToggle("aiDiagnosticsReady")}
              />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-medium">Report Ready</h3>
                <p className="text-sm text-muted-foreground">
                  Get notified immediately when your full report is available to view.
                </p>
              </div>
              <Switch checked={preferences.reportReady} onCheckedChange={() => handleToggle("reportReady")} />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-medium">Subscription & Billing Updates</h3>
                <p className="text-sm text-muted-foreground">
                  Receive important updates about payments, plan changes, and billing issues.
                </p>
              </div>
              <Switch
                checked={preferences.subscriptionBilling}
                onCheckedChange={() => handleToggle("subscriptionBilling")}
              />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-medium">Add-on Confirmations</h3>
                <p className="text-sm text-muted-foreground">
                  Get confirmation emails when you purchase add-ons (extra reviewers, faster delivery, etc).
                </p>
              </div>
              <Switch
                checked={preferences.addonConfirmations}
                onCheckedChange={() => handleToggle("addonConfirmations")}
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Critical account notifications (security alerts, etc.) will always be sent.
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
