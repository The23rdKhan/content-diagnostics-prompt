"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { CREATOR_PLANS } from "@/components/creator/plan-selector"
import { CapacityGatingModal } from "@/components/creator/capacity-gating-modal"
import { trackEvent } from "@/lib/analytics"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock } from "lucide-react"

export default function CreatorCheckout() {
  const [cardNumber, setCardNumber] = useState("")
  const [processingPayment, setProcessingPayment] = useState(false)
  const [showCapacityGating, setShowCapacityGating] = useState(false)
  const [selectedLanguage] = useState("English") // Locked to English for MVP
  const [isReady, setIsReady] = useState(false)
  const router = useRouter()

  // Guard: Ensure user has selected a plan before accessing checkout
  useEffect(() => {
    const plan = sessionStorage.getItem("selected_plan")
    if (!plan) {
      router.replace("/creators/onboarding/plan")
    } else {
      setIsReady(true)
    }
  }, [router])

  const selectedPlan = (typeof window !== "undefined" && sessionStorage.getItem("selected_plan")) || "basic"
  const selectedAddons = typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("selected_addons") || "[]")
    : []

  const plan = CREATOR_PLANS.find((p) => p.id === selectedPlan)
  const addonsTotal = selectedAddons.length * 25
  const total = (plan?.price || 49) + addonsTotal

  // Don't render until we've verified the prerequisite step was completed
  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const handleCheckout = async () => {
    if (!cardNumber) {
      alert("Please enter card number")
      return
    }

    trackEvent("checkout_started", { plan: selectedPlan, total })
    setShowCapacityGating(true)
  }

  const handleCapacityConfirmed = async () => {
    setProcessingPayment(true)
    trackEvent("capacity_confirmed", { language: selectedLanguage })

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500))

    trackEvent("checkout_completed", { plan: selectedPlan, total })
    sessionStorage.removeItem("selected_plan")
    sessionStorage.removeItem("selected_addons")
    router.push("/creators/onboarding/welcome")
    setProcessingPayment(false)
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <span>1. Plan Selection →</span>
            <span className="text-foreground">2. Checkout</span>
            <span>→ 3. Welcome</span>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-2">Complete Your Checkout</h1>
          <p className="text-lg text-muted-foreground">Review your plan and complete payment to get started</p>
        </div>

        {/* Capacity Gating Modal */}
        <CapacityGatingModal
          isOpen={showCapacityGating}
          selectedLanguage={selectedLanguage}
          selectedSLA={selectedPlan as "fast" | "standard" | "economy"}
          onClose={() => setShowCapacityGating(false)}
          onSelect={(option) => {
            trackEvent("capacity_option_selected", { option: option.id })
            handleCapacityConfirmed()
          }}
        />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Order summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">{plan?.name} Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    {plan?.reviewersPerVideo} reviewers • {plan?.deliveryDays}-day delivery
                  </p>
                  <div className="text-xl font-bold text-accent mt-2">${plan?.price}</div>
                </div>

                {selectedAddons.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold mb-2">Add-ons</h4>
                    <div className="space-y-2">
                      {selectedAddons.map((addon: string) => (
                        <div key={addon} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{addon}</span>
                          <span>$25</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-border flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-accent">${total}</span>
                </div>

                <div className="pt-4 border-t border-border">
                  <label className="text-sm font-medium block mb-2">Review Language</label>
                  <div className="relative">
                    <input
                      type="text"
                      value="English"
                      disabled
                      className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-foreground cursor-not-allowed"
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">MVP supports English only</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Internal testing only. Not representative of public performance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-accent/30 bg-accent/5">
                  <AlertCircle className="h-4 w-4 text-accent" />
                  <AlertDescription className="text-sm">
                    This is a mock checkout. No payment will be processed. Use any test card number.
                  </AlertDescription>
                </Alert>

                <div>
                  <label className="text-sm font-medium">Card Number</label>
                  <Input
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    disabled={processingPayment}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Expiry Date</label>
                    <Input placeholder="MM/YY" disabled={processingPayment} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">CVC</label>
                    <Input placeholder="123" disabled={processingPayment} className="mt-1" />
                  </div>
                </div>

                <Button onClick={handleCheckout} disabled={processingPayment} className="w-full" size="lg">
                  {processingPayment ? "Processing..." : "Complete Purchase"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
