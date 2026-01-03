"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { PlanSelector } from "@/components/creator/plan-selector"
import { trackEvent } from "@/lib/analytics"
import { ArrowRight, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CreatorPlanOnboarding() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const router = useRouter()

  const handleContinue = () => {
    if (!selectedPlan) {
      alert("Please select a plan")
      return
    }

    trackEvent("plan_selected", { plan: selectedPlan })
    sessionStorage.setItem("selected_plan", selectedPlan)
    router.push("/creators/onboarding/checkout")
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <span>1. Plan Selection</span>
            <span className="text-foreground">→ 2. Checkout → 3. Welcome</span>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-2">Select Your Plan</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Choose the plan that fits your feedback needs. Each plan includes AI diagnostics, structured reports, and
            guaranteed human reviewers.
          </p>
        </div>

        {/* Capacity gating message */}
        <Alert className="mb-8 border-accent/30 bg-accent/5">
          <AlertCircle className="h-4 w-4 text-accent" />
          <AlertDescription className="text-accent">
            All plans include guaranteed minimum reviewers and clear delivery windows. Capacity is available for your
            region.
          </AlertDescription>
        </Alert>

        {/* Plan selector */}
        <div className="mb-12">
          <PlanSelector selectedPlanId={selectedPlan || undefined} onSelectPlan={setSelectedPlan} />
        </div>

        {/* Continue button */}
        <div className="flex justify-end">
          <Button size="lg" onClick={handleContinue} disabled={!selectedPlan}>
            Continue to Checkout
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
