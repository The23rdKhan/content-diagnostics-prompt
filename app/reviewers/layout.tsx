"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { LoadingScreen } from "@/components/loading-screen"

export default function ReviewerLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Onboarding routes should be accessible during signup flow
  const isOnboardingRoute = pathname?.startsWith("/reviewers/onboarding")

  useEffect(() => {
    if (loading) return
    // Skip auth check for onboarding routes (they handle their own flow)
    if (isOnboardingRoute) return
    if (!isAuthenticated) {
      router.push("/auth/sign-in")
    } else if (user?.role !== "REVIEWER") {
      // Redirect to their correct dashboard
      if (user?.role === "CREATOR") router.push("/creators/dashboard")
      else if (user?.role === "ADMIN") router.push("/admin/dashboard")
      else router.push("/")
    }
  }, [isAuthenticated, user, router, loading, isOnboardingRoute, pathname])

  if (loading && !isOnboardingRoute) {
    return <LoadingScreen />
  }

  // Allow onboarding routes without full auth check
  if (isOnboardingRoute) {
    return <>{children}</>
  }

  if (!isAuthenticated || user?.role !== "REVIEWER") {
    return null
  }

  return <>{children}</>
}
