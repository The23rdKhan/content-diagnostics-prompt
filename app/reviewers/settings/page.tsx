"use client"

import { logError } from "@/lib/error-tracking"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"
import { User, Bell, CreditCard, ChevronRight, Save, RefreshCw } from "lucide-react"
import { useReviewerProfileWithUpdate } from "@/lib/hooks/use-profile"
import { useAuth } from "@/lib/auth-context"
import { trackEvent } from "@/lib/analytics"
import { PAYOUT_METHODS } from "@/lib/constants/payout-methods"

const settingsLinks = [
  {
    title: "Profile",
    description: "Edit your name and profile picture",
    href: "/reviewers/profile",
    icon: User,
  },
  {
    title: "Notifications",
    description: "Manage your email notification preferences",
    href: "/reviewers/settings/notifications",
    icon: Bell,
  },
]

export default function ReviewerSettingsPage() {
  const { refreshUser } = useAuth()
  const {
    profile,
    loading,
    updatePayoutMethod,
    updating,
    updateError,
  } = useReviewerProfileWithUpdate()

  const [selectedPayoutMethod, setSelectedPayoutMethod] = useState<string>("")
  const [payoutSaved, setPayoutSaved] = useState(false)

  // Initialize payout method from profile
  useState(() => {
    if (profile?.payoutMethod) {
      setSelectedPayoutMethod(profile.payoutMethod)
    }
  })

  const handlePayoutMethodChange = (value: string) => {
    setSelectedPayoutMethod(value)
    setPayoutSaved(false)
  }

  const handleSavePayoutMethod = async () => {
    if (!selectedPayoutMethod) return

    try {
      await updatePayoutMethod({
        payoutMethod: selectedPayoutMethod as "PAYPAL" | "BANK_TRANSFER" | "STRIPE_CONNECT",
      })
      await refreshUser() // Sync auth context
      trackEvent("reviewer_payout_method_updated", { method: selectedPayoutMethod })
      setPayoutSaved(true)
      setTimeout(() => setPayoutSaved(false), 3000)
    } catch (err) {
      logError("Failed to update payout method", err)
    }
  }

  const hasPayoutChanges = profile?.payoutMethod !== selectedPayoutMethod && selectedPayoutMethod !== ""

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/reviewers/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            &larr; Back to Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        {/* Settings Links */}
        <div className="grid gap-4 mb-6">
          {settingsLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="hover:bg-secondary/50 transition-colors cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                        <link.icon className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{link.title}</CardTitle>
                        <CardDescription className="text-sm">{link.description}</CardDescription>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {/* Payout Method Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <CreditCard className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-base">Payout Method</CardTitle>
                <CardDescription className="text-sm">
                  Choose how you want to receive your earnings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="payoutMethod">Preferred Payout Method</Label>
                <Select
                  value={selectedPayoutMethod || profile?.payoutMethod || ""}
                  onValueChange={handlePayoutMethodChange}
                  disabled={loading}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select payout method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYOUT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        <div>
                          <div>{method.label}</div>
                          <div className="text-xs text-muted-foreground">{method.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {updateError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3">
                  <p className="text-sm text-destructive">{updateError.message}</p>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleSavePayoutMethod}
                  disabled={updating || payoutSaved || !hasPayoutChanges || loading}
                >
                  {updating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {payoutSaved ? "Saved!" : "Save Payout Method"}
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Payout details (account numbers, etc.) will be collected when you request your first payout.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
