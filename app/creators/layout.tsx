"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LoadingScreen } from "@/components/loading-screen"

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      router.push("/auth/sign-in")
    } else if (user?.role !== "CREATOR") {
      // Redirect to their correct dashboard
      if (user?.role === "REVIEWER") router.push("/reviewers/dashboard")
      else if (user?.role === "ADMIN") router.push("/admin/dashboard")
      else router.push("/")
    }
  }, [isAuthenticated, user, router, loading])

  if (loading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated || user?.role !== "CREATOR") {
    return null
  }

  return <>{children}</>
}
