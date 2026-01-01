"use client"

import Link from "next/link"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const isAuthError = error.name === "AuthenticationError"
  const isAccessDenied = error.message === "Access denied."

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-8 text-center">
        <h1 className="text-2xl font-semibold text-card-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isAuthError
            ? "Your session expired. Please sign in again."
            : isAccessDenied
              ? "Access denied. You do not have permission to view this page."
              : "Please try again. If the problem persists, contact support."}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => reset()}>Try again</Button>
          {isAuthError && (
            <Button variant="outline" asChild>
              <Link href="/auth/sign-in">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
