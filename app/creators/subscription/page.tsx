"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check } from "lucide-react"
import { CREATOR_PLANS } from "@/components/creator/plan-selector"

export default function CreatorSubscription() {
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const currentPlan = "basic" // In production, fetch from user session

  const activePlan = CREATOR_PLANS.find((p) => p.id === currentPlan)
  const upgradablePlans = CREATOR_PLANS.filter((p) => p.id !== currentPlan)

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Subscription & Billing</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Manage your current plan, upgrade, downgrade, or cancel anytime.
        </p>

        {/* Current Plan */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Your Current Plan</h2>
          <Card className="border-2 border-accent">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle>{activePlan?.name} Plan</CardTitle>
                    <Badge className="bg-accent text-accent-foreground">Active</Badge>
                  </div>
                  <CardDescription>You're currently on this plan</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-accent">${activePlan?.price}</div>
                  <p className="text-sm text-muted-foreground">per video</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Reviewers Per Video</h4>
                  <div className="text-3xl font-bold text-accent">{activePlan?.reviewersPerVideo}</div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Delivery Window</h4>
                  <div className="text-3xl font-bold text-accent">{activePlan?.deliveryDays} days</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">What's Included</h4>
                <ul className="space-y-2">
                  {activePlan?.features.map((feature) => (
                    <li key={feature} className="flex gap-2 text-sm">
                      <Check className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-border flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={() => setShowCancelConfirm(true)}>
                  Cancel Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cancel confirmation */}
          {showCancelConfirm && (
            <Card className="mt-4 border-destructive bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive">Cancel Your Subscription?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  If you cancel, you'll lose access to submit new videos and won't receive reports for pending videos.
                  You can always reactivate your subscription later.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      alert("Subscription cancelled. You'll be able to reactivate anytime.")
                      setShowCancelConfirm(false)
                    }}
                  >
                    Yes, Cancel Subscription
                  </Button>
                  <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>
                    Keep My Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Upgrade / Downgrade Options */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Upgrade or Downgrade</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {upgradablePlans.map((plan) => (
              <Card key={plan.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{plan.name} Plan</CardTitle>
                  <div className="text-3xl font-bold text-accent mt-2">${plan.price}</div>
                  <CardDescription>per video submission</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="text-sm">
                    <div className="font-medium mb-1">{plan.reviewersPerVideo} reviewers</div>
                    <div className="text-muted-foreground">{plan.deliveryDays}-day delivery</div>
                  </div>

                  <ul className="space-y-2">
                    {plan.features.slice(0, 3).map((feature) => (
                      <li key={feature} className="flex gap-2 text-sm">
                        <Check className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full mt-4"
                    onClick={() => {
                      setShowUpgradeConfirm(true)
                      sessionStorage.setItem("upgrade_plan", plan.id)
                    }}
                  >
                    {plan.price > (activePlan?.price || 0) ? "Upgrade" : "Downgrade"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Upgrade confirmation */}
          {showUpgradeConfirm && (
            <Card className="mt-6 border-accent bg-accent/5">
              <CardHeader>
                <CardTitle className="text-accent">Confirm Plan Change</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  Your plan will change immediately. The cost difference will be prorated and adjusted on your next
                  invoice.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      alert("Plan updated successfully!")
                      setShowUpgradeConfirm(false)
                    }}
                  >
                    Confirm Plan Change
                  </Button>
                  <Button variant="outline" onClick={() => setShowUpgradeConfirm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
