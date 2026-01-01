"use client"

import type React from "react"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="flex justify-end p-4">
          <ThemeToggle />
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </AuthProvider>
  )
}
