"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth, ApiRequestError } from "@/lib/auth-context"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { signIn, user, loading } = useAuth()
  const router = useRouter()

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    setError("")
    setIsSubmitting(true)

    try {
      await signIn(email, password)
    } catch (err) {
      // Handle API errors with specific messages
      if (err instanceof ApiRequestError) {
        switch (err.code) {
          case "INVALID_CREDENTIALS":
            setError("Invalid email or password.")
            break
          case "ACCOUNT_DISABLED":
            setError("Your account has been disabled. Please contact support.")
            break
          default:
            setError(err.message || "Sign in failed. Please try again.")
        }
      } else {
        setError("Unable to connect to server. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Redirect after successful sign-in based on role
  useEffect(() => {
    // Wait for auth to finish loading before redirecting
    if (!loading && user) {
      const redirectPath =
        user.role === "ADMIN"
          ? "/admin/dashboard"
          : user.role === "REVIEWER"
            ? "/reviewers/dashboard"
            : "/creators/dashboard"
      router.push(redirectPath)
    }
  }, [user, loading, router])

  // Show loading or nothing while checking auth/redirecting
  if (loading || user) {
    return null
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>Access your Content Diagnostics account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              className="mt-1"
            />
          </div>

          <Button onClick={handleSignIn} disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth/sign-up" className="text-accent hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
