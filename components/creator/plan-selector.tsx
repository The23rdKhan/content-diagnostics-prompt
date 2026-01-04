"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export interface PlanOption {
  id: string
  name: string
  price: number
  reviewersPerVideo: number
  deliveryDays: number
  videosPerMonth: number
  monthlyCredits: number
  features: string[]
}

export const CREATOR_PLANS: PlanOption[] = [
  {
    id: "basic",
    name: "Starter",
    price: 49,
    reviewersPerVideo: 5,
    deliveryDays: 2,
    videosPerMonth: 3,
    monthlyCredits: 15,
    features: ["5 reviewers per video", "48-hour delivery", "15 credits per month", "AI diagnostics", "Basic reports"],
  },
  {
    id: "professional",
    name: "Pro",
    price: 149,
    reviewersPerVideo: 10,
    deliveryDays: 1,
    videosPerMonth: 10,
    monthlyCredits: 50,
    features: [
      "10 reviewers per video",
      "24-hour delivery",
      "50 credits per month",
      "AI diagnostics",
      "Detailed reports",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Studio",
    price: 399,
    reviewersPerVideo: 15,
    deliveryDays: 0.5,
    videosPerMonth: 50,
    monthlyCredits: 250,
    features: [
      "15 reviewers per video",
      "12-hour delivery",
      "250 credits per month",
      "AI diagnostics",
      "Comprehensive reports",
      "Dedicated support",
      "Custom reviewer pools",
    ],
  },
]

interface PlanSelectorProps {
  selectedPlanId?: string
  onSelectPlan: (planId: string) => void
}

export function PlanSelector({ selectedPlanId, onSelectPlan }: PlanSelectorProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {CREATOR_PLANS.map((plan) => (
        <Card
          key={plan.id}
          className={`cursor-pointer transition-all border-2 ${
            selectedPlanId === plan.id ? "border-accent bg-secondary/50" : "border-border hover:border-accent/50"
          }`}
          onClick={() => onSelectPlan(plan.id)}
        >
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <div className="text-3xl font-bold text-accent mt-2">${plan.price}</div>
            <CardDescription>billed monthly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                {plan.reviewersPerVideo} reviewers • {plan.deliveryDays}-day delivery • {plan.videosPerMonth} videos/mo
              </div>
            </div>
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2 text-sm">
                  <Check className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              variant={selectedPlanId === plan.id ? "default" : "outline"}
              onClick={() => onSelectPlan(plan.id)}
            >
              {selectedPlanId === plan.id ? "Selected" : "Select Plan"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
