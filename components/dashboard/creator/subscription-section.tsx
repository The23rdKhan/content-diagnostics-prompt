"use client"

import { logError } from "@/lib/error-tracking"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, ArrowRight, AlertCircle, RefreshCw, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCreatorSubscription, useAvailablePlans, useChangePlan } from "@/lib/hooks/use-subscription"

export function SubscriptionSection() {
  const { subscription, loading: subLoading, error: subError, refetch: refetchSub } = useCreatorSubscription()
  const { plans, loading: plansLoading, error: plansError, refetch: refetchPlans } = useAvailablePlans()
  const { changePlan, loading: changing, error: changeError, clearError } = useChangePlan()

  const [confirmPlanId, setConfirmPlanId] = useState<string | null>(null)
  const [changeSuccess, setChangeSuccess] = useState(false)

  const loading = subLoading || plansLoading
  const error = subError || plansError

  const handlePlanChange = async (planId: string) => {
    if (confirmPlanId === planId) {
      // Confirmed, execute the change
      clearError()
      try {
        await changePlan({ planId })
        setConfirmPlanId(null)
        setChangeSuccess(true)
        refetchSub()
        setTimeout(() => setChangeSuccess(false), 5000)
      } catch (err) {
        logError("Failed to change plan", err)
      }
    } else {
      // First click, show confirmation
      setConfirmPlanId(planId)
      setTimeout(() => setConfirmPlanId(null), 5000) // Reset after 5 seconds
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const formatPrice = (price: number) => {
    return `$${price}`
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-20 w-full rounded-lg mb-4" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-destructive bg-destructive/5 p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-bold text-destructive">Failed to Load Subscription</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Button className="mt-4" onClick={() => { refetchSub(); refetchPlans(); }}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  // Fallback display if no subscription data
  const currentPlan = subscription
  const displayPlans = plans.length > 0 ? plans : [
    { id: "basic", name: "Starter", price: 49, reviewersPerVideo: 5, features: [], interval: "MONTHLY" as const },
    { id: "professional", name: "Pro", price: 149, reviewersPerVideo: 10, features: [], interval: "MONTHLY" as const },
    { id: "enterprise", name: "Studio", price: 399, reviewersPerVideo: 15, features: [], interval: "MONTHLY" as const },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">Current Plan</h2>
        <div className="mt-4 flex items-center justify-between rounded-lg bg-accent/10 p-4">
          <div>
            <p className="text-xl font-bold text-foreground">
              {currentPlan?.planName ?? "No Active Plan"}
            </p>
            <p className="text-sm text-muted-foreground">
              {currentPlan
                ? `${currentPlan.reviewersPerVideo} reviewers per video • ${formatPrice(currentPlan.price)}/month`
                : "Subscribe to get started"
              }
            </p>
          </div>
          {currentPlan && (
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${
              currentPlan.status === "ACTIVE"
                ? "bg-accent text-accent-foreground"
                : currentPlan.status === "TRIALING"
                  ? "bg-blue-500/10 text-blue-600"
                  : "bg-amber-500/10 text-amber-600"
            }`}>
              {currentPlan.status === "ACTIVE" ? "Active" :
               currentPlan.status === "TRIALING" ? "Trial" :
               currentPlan.status === "PAST_DUE" ? "Past Due" : "Canceled"}
            </span>
          )}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Videos This Month</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {currentPlan?.videosThisMonth ?? 0} / Unlimited
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Next Billing Date</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {currentPlan?.nextBillingDate ? formatDate(currentPlan.nextBillingDate) : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {changeSuccess && (
        <Alert className="border-green-500/30 bg-green-500/10">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">
            Your plan has been updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {changeError && (
        <Alert className="border-destructive/30 bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            {changeError.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">Change Plan</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {displayPlans.map((plan) => {
            const isCurrent = currentPlan?.planId === plan.id
            const isUpgrade = currentPlan ? plan.price > currentPlan.price : false
            const isConfirming = confirmPlanId === plan.id

            return (
              <div
                key={plan.id}
                className={`rounded-lg border p-4 ${isCurrent ? "border-accent bg-accent/5" : "border-border"}`}
              >
                <h3 className="font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-2xl font-bold text-foreground">{formatPrice(plan.price)}</p>
                <p className="text-sm text-muted-foreground">
                  {plan.reviewersPerVideo >= 100 ? `${plan.reviewersPerVideo}+` : plan.reviewersPerVideo} reviewers
                </p>
                {isCurrent ? (
                  <Button className="mt-4 w-full" disabled>
                    <Check className="h-4 w-4 mr-1" />
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    variant={isConfirming ? "default" : "outline"}
                    className={`mt-4 w-full ${!isConfirming ? "bg-transparent" : ""}`}
                    onClick={() => handlePlanChange(plan.id)}
                    disabled={changing}
                  >
                    {changing && confirmPlanId === plan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Changing...
                      </>
                    ) : isConfirming ? (
                      "Click to Confirm"
                    ) : (
                      <>
                        {isUpgrade ? "Upgrade" : "Downgrade"}
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">Plan Features</h2>
        <ul className="space-y-3">
          {(currentPlan?.features?.length ? currentPlan.features : [
            "10 reviewers per video",
            "AI diagnostics included",
            "Asynchronous human feedback",
            "24-hour turnaround",
            "Detailed reports",
            "Priority support",
          ]).map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              <Check className="h-4 w-4 text-accent" />
              <span className="text-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
