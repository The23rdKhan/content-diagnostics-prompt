"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { trackEvent } from "@/lib/analytics"
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Clear plan selection from session (payment is complete)
    sessionStorage.removeItem("selected_plan")
    sessionStorage.removeItem("selected_addons")

    // Track successful checkout
    trackEvent("checkout_completed", { source: "stripe" })

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
  }, [router])

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
