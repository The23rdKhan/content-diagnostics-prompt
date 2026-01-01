"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreditCard, Building, AlertCircle, Check, CheckCircle } from "lucide-react"
import { trackEvent } from "@/lib/analytics"

export function PayoutSection() {
  const [payoutMethod, setPayoutMethod] = useState<"paypal" | "bank">("paypal")
  const [isVerified, setIsVerified] = useState(true) // Mock verified state
  const [isSaved, setIsSaved] = useState(false)

  const handleSaveSettings = () => {
    setIsSaved(true)
    trackEvent("reviewer_payout_method_saved", { method: payoutMethod })
    setTimeout(() => setIsSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">Payout Method</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose how you want to receive your earnings</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <button
            onClick={() => setPayoutMethod("paypal")}
            className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
              payoutMethod === "paypal" ? "border-accent bg-accent/5" : "border-border hover:bg-secondary"
            }`}
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
            onClick={() => setPayoutMethod("bank")}
            className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
              payoutMethod === "bank" ? "border-accent bg-accent/5" : "border-border hover:bg-secondary"
            }`}
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
            {isVerified && (
              <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-500">
                <CheckCircle className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">PayPal Email</label>
              <Input type="email" placeholder="your@email.com" defaultValue="reviewer@example.com" />
            </div>
            <Button onClick={handleSaveSettings}>{isSaved ? "Saved!" : "Save PayPal Settings"}</Button>
          </div>
        </div>
      )}

      {payoutMethod === "bank" && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-card-foreground">Bank Account Settings</h3>
            {isVerified && (
              <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-500">
                <CheckCircle className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Account Holder Name</label>
              <Input placeholder="John Doe" defaultValue="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Bank Name</label>
              <Input placeholder="Your Bank" defaultValue="Chase Bank" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Routing Number</label>
                <Input placeholder="123456789" defaultValue="•••••6789" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Account Number</label>
                <Input placeholder="••••••••1234" defaultValue="••••••••1234" />
              </div>
            </div>
            <Button onClick={handleSaveSettings}>{isSaved ? "Saved!" : "Save Bank Settings"}</Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-card-foreground mb-4">Payout Schedule</h3>
        <div className="rounded-lg bg-secondary p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-foreground">Automatic payouts every 2 weeks</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Minimum balance of $10 required. Payouts are processed on the 1st and 15th of each month.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-card-foreground">Request Payout</h3>
            <p className="text-sm text-muted-foreground">Available balance: $42.30</p>
          </div>
          <Button>Request Payout</Button>
        </div>
      </div>
    </div>
  )
}
