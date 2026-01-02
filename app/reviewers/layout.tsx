"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ReviewerLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      router.push("/auth/sign-in")
    } else if (user?.role !== "REVIEWER") {
      // Redirect to their correct dashboard
      if (user?.role === "CREATOR") router.push("/creators/dashboard")
      else if (user?.role === "ADMIN") router.push("/admin/dashboard")
      else router.push("/")
    }
  }, [isAuthenticated, user, router, loading])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== "REVIEWER") {
    return null
  }

  return <>{children}</>
}
