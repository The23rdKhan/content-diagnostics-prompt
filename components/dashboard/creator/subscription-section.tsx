"use client"

import { Button } from "@/components/ui/button"
import { Check, ArrowRight } from "lucide-react"

export function SubscriptionSection() {
  const plans = [
    {
      name: "Starter",
      price: "$49",
      reviewers: "20",
      current: false,
    },
    {
      name: "Pro",
      price: "$149",
      reviewers: "50",
      current: true,
    },
    {
      name: "Studio",
      price: "$399",
      reviewers: "100+",
      current: false,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">Current Plan</h2>
        <div className="mt-4 flex items-center justify-between rounded-lg bg-accent/10 p-4">
          <div>
            <p className="text-xl font-bold text-foreground">Pro Plan</p>
            <p className="text-sm text-muted-foreground">50 reviewers per video • $149/month</p>
          </div>
          <span className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">Active</span>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Videos This Month</p>
            <p className="mt-1 text-2xl font-bold text-foreground">4 / Unlimited</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Next Billing Date</p>
            <p className="mt-1 text-2xl font-bold text-foreground">Jan 15, 2026</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">Change Plan</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg border p-4 ${plan.current ? "border-accent bg-accent/5" : "border-border"}`}
            >
              <h3 className="font-semibold text-foreground">{plan.name}</h3>
              <p className="mt-1 text-2xl font-bold text-foreground">{plan.price}</p>
              <p className="text-sm text-muted-foreground">{plan.reviewers} reviewers</p>
              {plan.current ? (
                <Button className="mt-4 w-full" disabled>
                  <Check className="h-4 w-4 mr-1" />
                  Current Plan
                </Button>
              ) : (
                <Button variant="outline" className="mt-4 w-full bg-transparent">
                  {plan.name === "Starter" ? "Downgrade" : "Upgrade"}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">Plan Features</h2>
        <ul className="space-y-3">
          {[
            "Minimum 50 reviewers per video",
            "AI diagnostics included",
            "Asynchronous human feedback",
            "24-hour turnaround",
            "Detailed reports",
            "Priority support",
          ].map((feature, index) => (
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
