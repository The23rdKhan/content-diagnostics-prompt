"use client"

import { logError } from "@/lib/error-tracking"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreditCard, Building, AlertCircle, Check, CheckCircle, RefreshCw, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { trackEvent } from "@/lib/analytics"
import { useReviewerProfileWithUpdate } from "@/lib/hooks/use-profile"
import { useReviewerEarnings } from "@/lib/hooks/use-reviewer"

type PayoutMethodType = "paypal" | "bank"

export function PayoutSection() {
  const { profile, loading: profileLoading, error: profileError, refetch: refetchProfile, updatePayoutMethod, updating, updateError } = useReviewerProfileWithUpdate()
  const { earnings, loading: earningsLoading, error: earningsError, refetch: refetchEarnings } = useReviewerEarnings()

  const [payoutMethod, setPayoutMethod] = useState<PayoutMethodType>("paypal")
  const [paypalEmail, setPaypalEmail] = useState("")
  const [bankDetails, setBankDetails] = useState({
    accountHolder: "",
    bankName: "",
    routingNumber: "",
    accountNumber: "",
  })
  const [isSaved, setIsSaved] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Sync profile data when loaded
  useEffect(() => {
    if (profile) {
      const method = profile.payoutMethod === "BANK_TRANSFER" ? "bank" : "paypal"
      setPayoutMethod(method)
      setHasChanges(false)
    }
  }, [profile])

  const handleMethodChange = (method: PayoutMethodType) => {
    setPayoutMethod(method)
    setHasChanges(true)
    setIsSaved(false)
  }

  const handleSaveSettings = async () => {
    try {
      const apiMethod = payoutMethod === "bank" ? "BANK_TRANSFER" : "PAYPAL"
      const details = payoutMethod === "paypal" ? paypalEmail : JSON.stringify(bankDetails)

      await updatePayoutMethod({
        payoutMethod: apiMethod as "PAYPAL" | "BANK_TRANSFER" | "STRIPE_CONNECT",
        payoutDetails: details,
      })

      setIsSaved(true)
      setHasChanges(false)
      trackEvent("reviewer_payout_method_saved", { method: payoutMethod })
      setTimeout(() => setIsSaved(false), 3000)
    } catch (err) {
      logError("Failed to save payout settings", err)
    }
  }

  const loading = profileLoading || earningsLoading
  const error = profileError || earningsError

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-64 mb-6" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-destructive bg-destructive/5 p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-bold text-destructive">Failed to Load Payout Settings</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Button className="mt-4" onClick={() => { refetchProfile(); refetchEarnings(); }}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  const availableBalance = earnings?.availableForPayout ?? 0
  const minPayoutAmount = 10
  const canRequestPayout = availableBalance >= minPayoutAmount

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">Payout Method</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose how you want to receive your earnings</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <button
            onClick={() => handleMethodChange("paypal")}
            disabled={updating}
            className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
              payoutMethod === "paypal" ? "border-accent bg-accent/5" : "border-border hover:bg-secondary"
            } ${updating ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            </div>
            <div className="text-left flex-1">
              <p className="font-medium text-foreground">PayPal</p>
              <p className="text-sm text-muted-foreground">Fast transfers worldwide</p>
            </div>
            {payoutMethod === "paypal" && <Check className="ml-auto h-5 w-5 text-accent" />}
          </button>

          <button
            onClick={() => handleMethodChange("bank")}
            disabled={updating}
            className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
              payoutMethod === "bank" ? "border-accent bg-accent/5" : "border-border hover:bg-secondary"
            } ${updating ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <Building className="h-5 w-5 text-green-600 dark:text-green-500" />
            </div>
            <div className="text-left flex-1">
              <p className="font-medium text-foreground">Bank Transfer</p>
              <p className="text-sm text-muted-foreground">Direct to your bank account</p>
            </div>
            {payoutMethod === "bank" && <Check className="ml-auto h-5 w-5 text-accent" />}
          </button>
        </div>
      </div>

      {payoutMethod === "paypal" && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-card-foreground">PayPal Settings</h3>
            {profile?.payoutMethod === "PAYPAL" && (
              <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-500">
                <CheckCircle className="h-3 w-3" />
                Active
              </span>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">PayPal Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={paypalEmail}
                onChange={(e) => { setPaypalEmail(e.target.value); setHasChanges(true); setIsSaved(false); }}
                disabled={updating}
              />
            </div>
            <Button onClick={handleSaveSettings} disabled={updating || !hasChanges}>
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isSaved ? (
                "Saved!"
              ) : (
                "Save PayPal Settings"
              )}
            </Button>
          </div>
        </div>
      )}

      {payoutMethod === "bank" && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-card-foreground">Bank Account Settings</h3>
            {profile?.payoutMethod === "BANK_TRANSFER" && (
              <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-500">
                <CheckCircle className="h-3 w-3" />
                Active
              </span>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Account Holder Name</label>
              <Input
                placeholder="John Doe"
                value={bankDetails.accountHolder}
                onChange={(e) => { setBankDetails(prev => ({ ...prev, accountHolder: e.target.value })); setHasChanges(true); setIsSaved(false); }}
                disabled={updating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Bank Name</label>
              <Input
                placeholder="Your Bank"
                value={bankDetails.bankName}
                onChange={(e) => { setBankDetails(prev => ({ ...prev, bankName: e.target.value })); setHasChanges(true); setIsSaved(false); }}
                disabled={updating}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Routing Number</label>
                <Input
                  placeholder="123456789"
                  value={bankDetails.routingNumber}
                  onChange={(e) => { setBankDetails(prev => ({ ...prev, routingNumber: e.target.value })); setHasChanges(true); setIsSaved(false); }}
                  disabled={updating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Account Number</label>
                <Input
                  placeholder="••••••••1234"
                  value={bankDetails.accountNumber}
                  onChange={(e) => { setBankDetails(prev => ({ ...prev, accountNumber: e.target.value })); setHasChanges(true); setIsSaved(false); }}
                  disabled={updating}
                />
              </div>
            </div>
            <Button onClick={handleSaveSettings} disabled={updating || !hasChanges}>
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isSaved ? (
                "Saved!"
              ) : (
                "Save Bank Settings"
              )}
            </Button>
          </div>
        </div>
      )}

      {updateError && (
        <Alert className="border-destructive/30 bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            {updateError.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-card-foreground mb-4">Payout Schedule</h3>
        <div className="rounded-lg bg-secondary p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-foreground">Automatic payouts every 2 weeks</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Minimum balance of ${minPayoutAmount} required. Payouts are processed on the 1st and 15th of each month.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-card-foreground">Request Payout</h3>
            <p className="text-sm text-muted-foreground">
              Available balance: <span className="font-medium text-accent">${availableBalance.toFixed(2)}</span>
            </p>
            {!canRequestPayout && availableBalance > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Minimum ${minPayoutAmount} required for payout
              </p>
            )}
          </div>
          <Button disabled={!canRequestPayout}>
            Request Payout
          </Button>
        </div>
      </div>
    </div>
  )
}
