"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeToggle } from "@/components/theme-toggle"
import { CREATOR_PLANS } from "@/components/creator/plan-selector"
import { trackEvent } from "@/lib/analytics"
import { api, ApiRequestError } from "@/lib/api"
import { LoadingScreen } from "@/components/loading-screen"
import { Lock, ArrowLeft, CreditCard, Shield, Loader2, AlertCircle } from "lucide-react"

interface CheckoutSessionResponse {
  sessionId: string
  url: string
}

export default function CreatorCheckout() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("basic")

  const router = useRouter()

  // Guard: Ensure user has selected a plan before accessing checkout
  useEffect(() => {
    const plan = sessionStorage.getItem("selected_plan")
    const isValidPlan = plan ? CREATOR_PLANS.some((p) => p.id === plan) : false

    if (!plan || !isValidPlan) {
      sessionStorage.removeItem("selected_plan")
      router.replace("/creators/onboarding/plan")
    } else {
      setSelectedPlan(plan)
      setIsReady(true)
    }
  }, [router])

  const plan = CREATOR_PLANS.find((p) => p.id === selectedPlan)

  // Don't render until we've verified the prerequisite step was completed
  if (!isReady) {
    return <LoadingScreen />
  }

  const handleProceedToPayment = async () => {
    setError(null)
    setIsProcessing(true)

    trackEvent("checkout_started", { plan: selectedPlan, total: plan?.price })

    try {
      const response = await api.post<CheckoutSessionResponse>(
        "/billing/stripe/checkout-session",
        {
          planTier: selectedPlan,
          successUrl: `${window.location.origin}/creators/onboarding/checkout/success`,
          cancelUrl: `${window.location.origin}/creators/onboarding/checkout`,
        }
      )

      trackEvent("stripe_redirect", { plan: selectedPlan })

      // Redirect to Stripe hosted checkout
      window.location.href = response.url
    } catch (err) {
      setIsProcessing(false)

      if (err instanceof ApiRequestError) {
        if (err.status === 401) {
          setError("Please sign in to continue with checkout.")
          router.push("/auth/sign-in?redirect=/creators/onboarding/checkout")
          return
        } else if (err.status === 404) {
          setError("Payment processing is not available yet. Please contact support.")
        } else {
          setError(err.message || "Failed to start checkout. Please try again.")
        }
      } else {
        setError("Unable to connect to payment service. Please try again.")
      }

      trackEvent("checkout_error", { plan: selectedPlan, error: String(err) })
    }
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
            <span className="text-foreground font-medium">2. Checkout</span>
            <span>→ 3. Welcome</span>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-2">Complete Your Checkout</h1>
          <p className="text-lg text-muted-foreground">Review your order and proceed to secure payment</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
                    {plan?.reviewersPerVideo} reviewers • {plan?.deliveryDays}-day delivery • {plan?.videosPerMonth} videos/mo
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Includes {plan?.monthlyCredits} credits per month
                  </p>
                  <div className="text-xl font-bold text-accent mt-2">${plan?.price}/mo</div>
                </div>

                <div className="pt-4 border-t border-border flex justify-between">
                  <span className="font-semibold">Monthly Total</span>
                  <span className="text-xl font-bold text-accent">${plan?.price}/mo</span>
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

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Add-ons like extra reviewers or faster delivery can be purchased when you submit each video.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Secure Payment
                </CardTitle>
                <CardDescription>
                  You&apos;ll be redirected to Stripe to complete your payment securely.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Secure checkout powered by Stripe</p>
                      <p className="text-xs text-muted-foreground">
                        Your payment information is encrypted and secure.
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Cancel anytime from your dashboard</p>
                    <p>• Subscription renews monthly</p>
                    <p>• Receipt sent to your email</p>
                  </div>
                </div>

                <Button
                  onClick={handleProceedToPayment}
                  disabled={isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirecting to payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Proceed to Payment
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full"
                  asChild
                  disabled={isProcessing}
                >
                  <Link href="/creators/onboarding/plan">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Change Plan
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
