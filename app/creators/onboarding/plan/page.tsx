"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ThemeToggle } from "@/components/theme-toggle"
import { PlanSelector } from "@/components/creator/plan-selector"
import { trackEvent } from "@/lib/analytics"
import { ArrowRight, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CreatorPlanOnboarding() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const router = useRouter()

  const addons = [
    {
      id: "extra-reviewers",
      name: "Extra Reviewers",
      description: "Add 2 more reviewers to your video submission",
      price: 30,
    },
    { id: "faster-delivery", name: "Faster Delivery", description: "Cut delivery time in half", price: 25 },
    { id: "full-watch", name: "Full Watch Guarantee", description: "Reviewers must watch entire video", price: 20 },
  ]

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddons((prev) => (prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]))
  }

  const handleContinue = () => {
    if (!selectedPlan) {
      alert("Please select a plan")
      return
    }

    trackEvent("plan_selected", { plan: selectedPlan, addons: selectedAddons })
    sessionStorage.setItem("selected_plan", selectedPlan)
    sessionStorage.setItem("selected_addons", JSON.stringify(selectedAddons))
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

        {/* Add-ons section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Optional Add-ons</CardTitle>
            <CardDescription>Enhance your review package with these optional upgrades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {addons.map((addon) => (
              <div key={addon.id} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                <Checkbox
                  id={addon.id}
                  checked={selectedAddons.includes(addon.id)}
                  onCheckedChange={() => handleToggleAddon(addon.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor={addon.id} className="font-medium cursor-pointer">
                    {addon.name}
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">{addon.description}</p>
                </div>
                <div className="text-lg font-semibold text-accent flex-shrink-0">+${addon.price}</div>
              </div>
            ))}
          </CardContent>
        </Card>

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
