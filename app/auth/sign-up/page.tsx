"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth, type UserRole, ApiRequestError } from "@/lib/auth-context"
import { trackEvent } from "@/lib/analytics"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignUpPage() {
  const [roleSelection, setRoleSelection] = useState<UserRole | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const { signUp, loading } = useAuth()
  const router = useRouter()

  const handleSignUp = async () => {
    if (!roleSelection || !email || !password || !name) {
      setError("Please fill in all fields")
      return
    }

    try {
      trackEvent(`${roleSelection.toLowerCase()}_signup_started`)
      await signUp(email, password, roleSelection, name)
      trackEvent(`${roleSelection.toLowerCase()}_signup_completed`)

      // Redirect based on role
      if (roleSelection === "CREATOR") {
        router.push("/creators/onboarding/plan")
      } else {
        router.push("/reviewers/onboarding/rules")
      }
    } catch (err) {
      if (err instanceof ApiRequestError) {
        switch (err.code) {
          case "EMAIL_EXISTS":
            setError("An account with this email already exists. Please sign in instead.")
            break
          case "INVALID_EMAIL":
            setError("Please enter a valid email address.")
            break
          case "WEAK_PASSWORD":
            setError("Password must be at least 8 characters with uppercase, lowercase, and a number.")
            break
          case "INVALID_ROLE":
            setError("Invalid role selection. Please try again.")
            break
          default:
            setError(err.message || "Sign up failed. Please try again.")
        }
      } else {
        setError("Unable to connect to server. Please check your connection.")
      }
      console.error(err)
    }
  }

  // Role selection screen
  if (!roleSelection) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to Content Diagnostics</CardTitle>
            <CardDescription>Choose your role to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <button
              onClick={() => setRoleSelection("CREATOR")}
              className="w-full p-4 border border-border rounded-lg hover:bg-secondary transition-colors text-left"
            >
              <h3 className="font-semibold text-foreground mb-1">I'm a Creator</h3>
              <p className="text-sm text-muted-foreground">I want feedback on my content before publishing</p>
            </button>

            <button
              onClick={() => setRoleSelection("REVIEWER")}
              className="w-full p-4 border border-border rounded-lg hover:bg-secondary transition-colors text-left"
            >
              <h3 className="font-semibold text-foreground mb-1">I'm a Reviewer</h3>
              <p className="text-sm text-muted-foreground">I want to get paid reviewing content</p>
            </button>

            <div className="pt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/sign-in" className="text-accent hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Sign up form screen
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Button variant="ghost" className="w-fit mx-auto mb-4" onClick={() => setRoleSelection(null)}>
            ← Back
          </Button>
          <CardTitle className="text-2xl">
            {roleSelection === "CREATOR" ? "Create Creator Account" : "Create Reviewer Account"}
          </CardTitle>
          <CardDescription>
            {roleSelection === "CREATOR"
              ? "Get feedback on your content from paid human reviewers"
              : "Join our reviewer network and earn money"}
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
            <label className="text-sm font-medium">Full Name</label>
            <Input
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
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
              disabled={loading}
              className="mt-1"
            />
          </div>

          <Button onClick={handleSignUp} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="text-accent hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
