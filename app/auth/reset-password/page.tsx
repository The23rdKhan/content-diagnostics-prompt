"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api, ApiRequestError } from "@/lib/api"
import { AlertCircle, Loader2, Lock, CheckCircle, ArrowLeft } from "lucide-react"

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Check for token on mount
  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset link.")
    }
  }, [token])

  const validatePassword = (): boolean => {
    if (!password) {
      setError("Please enter a new password")
      return false
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return false
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset link.")
      return
    }

    if (!validatePassword()) {
      return
    }

    setError("")
    setIsSubmitting(true)

    try {
      await api.post("/auth/reset-password", { token, password })
      setIsSuccess(true)
      // Redirect to sign-in after 3 seconds
      setTimeout(() => {
        router.push("/auth/sign-in?reset=success")
      }, 3000)
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.code === "INVALID_TOKEN" || err.code === "TOKEN_EXPIRED") {
          setError("This reset link has expired or is invalid. Please request a new one.")
        } else if (err.code === "WEAK_PASSWORD") {
          setError("Password is too weak. Please choose a stronger password.")
        } else if (err.status === 404) {
          // Endpoint doesn't exist yet
          setError("Password reset is not available yet. Please contact support.")
        } else {
          setError(err.message || "Something went wrong. Please try again.")
        }
      } else {
        setError("Unable to connect to server. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="mt-4 text-2xl">Password Reset Complete</CardTitle>
            <CardDescription>
              Your password has been successfully reset. You&apos;ll be redirected to sign in shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/auth/sign-in">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Sign In Now
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No token state
  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="mt-4 text-2xl">Invalid Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/auth/forgot-password">
                Request New Reset Link
              </Link>
            </Button>
            <div className="text-center">
              <Link href="/auth/sign-in" className="text-sm text-accent hover:underline">
                <ArrowLeft className="mr-1 inline h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <label className="text-sm font-medium">New Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              className="mt-1"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Must be at least 8 characters
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Confirm Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              disabled={isSubmitting}
              className="mt-1"
            />
          </div>

          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Reset Password
              </>
            )}
          </Button>

          <div className="text-center">
            <Link href="/auth/sign-in" className="text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-1 inline h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
          <CardTitle className="mt-4 text-2xl">Loading...</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  )
}
