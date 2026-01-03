"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { LoadingScreen } from "@/components/loading-screen"

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Onboarding routes should be accessible during signup flow
  const isOnboardingRoute = pathname?.startsWith("/creators/onboarding")

  useEffect(() => {
    if (loading) return
    // Skip auth check for onboarding routes (they handle their own flow)
    if (isOnboardingRoute) return
    if (!isAuthenticated) {
      router.push("/auth/sign-in")
    } else if (user?.role !== "CREATOR") {
      // Redirect to their correct dashboard
      if (user?.role === "REVIEWER") router.push("/reviewers/dashboard")
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

  if (!isAuthenticated || user?.role !== "CREATOR") {
    return null
  }

  return <>{children}</>
}
