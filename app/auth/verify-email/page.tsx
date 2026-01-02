"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api, ApiRequestError } from "@/lib/api"
import { AlertCircle, Loader2, CheckCircle, Mail, ArrowRight } from "lucide-react"

type VerificationState = "verifying" | "success" | "error" | "resend"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [state, setState] = useState<VerificationState>(token ? "verifying" : "error")
  const [error, setError] = useState("")
  const [resendEmail, setResendEmail] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  // Auto-verify on mount if token present
  useEffect(() => {
    if (!token) {
      setError("Invalid or missing verification link.")
      setState("error")
      return
    }

    const verifyEmail = async () => {
      try {
        await api.post("/auth/verify-email", { token })
        setState("success")
      } catch (err) {
        if (err instanceof ApiRequestError) {
          if (err.code === "INVALID_TOKEN" || err.code === "TOKEN_EXPIRED") {
            setError("This verification link has expired or is invalid.")
          } else if (err.code === "EMAIL_ALREADY_VERIFIED") {
            setState("success") // Already verified is still success
          } else if (err.status === 404) {
            setError("Email verification is not available yet. Please contact support.")
          } else {
            setError(err.message || "Verification failed. Please try again.")
          }
        } else {
          setError("Unable to connect to server. Please try again.")
        }
        setState("error")
      }
    }

    verifyEmail()
  }, [token])

  const handleResendVerification = async () => {
    if (!resendEmail) {
      setError("Please enter your email address")
      return
    }

    setError("")
    setIsResending(true)

    try {
      await api.post("/auth/resend-verification", { email: resendEmail })
      setResendSuccess(true)
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 404) {
          setError("This feature is not available yet. Please contact support.")
        } else {
          setError(err.message || "Failed to resend verification email.")
        }
      } else {
        setError("Unable to connect to server. Please try again.")
      }
    } finally {
      setIsResending(false)
    }
  }

  // Verifying state
  if (state === "verifying") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
            <CardTitle className="mt-4 text-2xl">Verifying Your Email</CardTitle>
            <CardDescription>
              Please wait while we verify your email address...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Success state
  if (state === "success") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="mt-4 text-2xl">Email Verified!</CardTitle>
            <CardDescription>
              Your email has been successfully verified. You can now access all features of your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/auth/sign-in">
                Continue to Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state with resend option
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="mt-4 text-2xl">Verification Failed</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {resendSuccess ? (
            <Alert className="border-green-500/30 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Verification email sent! Check your inbox.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Enter your email to receive a new verification link:
              </p>
              <div>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleResendVerification()}
                  disabled={isResending}
                />
              </div>
              {error && !resendSuccess && state === "resend" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                onClick={() => {
                  setState("resend")
                  handleResendVerification()
                }}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </>
          )}

          <div className="text-center">
            <Link href="/auth/sign-in" className="text-sm text-accent hover:underline">
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  )
}
