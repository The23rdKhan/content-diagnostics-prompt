"use client"

import type React from "react"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LoadingScreen } from "@/components/loading-screen"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      router.push("/auth/sign-in")
    } else if (user?.role !== "ADMIN") {
      // Redirect to their correct dashboard
      if (user?.role === "CREATOR") router.push("/creators/dashboard")
      else if (user?.role === "REVIEWER") router.push("/reviewers/dashboard")
      else router.push("/")
    }
  }, [isAuthenticated, user, router, loading])

  if (loading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
