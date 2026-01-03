"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { trackEvent } from "@/lib/analytics"
import { api } from "@/lib/api"
import { LoadingScreen } from "@/components/loading-screen"
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react"

function CheckoutSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(5)
  const [activating, setActivating] = useState(true)

  useEffect(() => {
    const activateSubscription = async () => {
      const sessionId = searchParams.get("session_id")
      const selectedPlan = sessionStorage.getItem("selected_plan") || "basic"

      // If this is a mock session (dev mode), activate the subscription
      if (sessionId?.startsWith("mock_session_")) {
        try {
          await api.post(`/creator/subscription/activate?planTier=${selectedPlan}`, {})
          trackEvent("mock_subscription_activated", { plan: selectedPlan })
        } catch (error) {
          console.error("Failed to activate mock subscription:", error)
        }
      }

      setActivating(false)

      // Clear plan selection from session (payment is complete)
      sessionStorage.removeItem("selected_plan")
      sessionStorage.removeItem("selected_addons")

      // Track successful checkout
      trackEvent("checkout_completed", { source: sessionId?.startsWith("mock_") ? "mock" : "stripe" })
    }

    activateSubscription()
  }, [searchParams])

  useEffect(() => {
    if (activating) return

    // Auto-redirect countdown
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer)
          router.push("/creators/onboarding/welcome")
          return 0
        }
        return c - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router, activating])

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <span className="text-accent">1. Plan Selection ✓</span>
            <span className="text-accent">→ 2. Checkout ✓</span>
            <span>→ 3. Welcome</span>
          </div>
        </div>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription className="text-base">
              Your subscription is now active. You&apos;re ready to start getting feedback on your content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              <p>A confirmation email has been sent to your registered email address with your receipt and subscription details.</p>
            </div>

            <div className="space-y-3">
              <Button className="w-full" size="lg" asChild>
                <Link href="/creators/onboarding/welcome">
                  Continue to Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Redirecting in {countdown} seconds...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
