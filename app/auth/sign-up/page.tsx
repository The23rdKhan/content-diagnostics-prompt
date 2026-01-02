"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useAuth, type UserRole, ApiRequestError } from "@/lib/auth-context"
import { trackEvent } from "@/lib/analytics"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { COUNTRIES } from "@/lib/constants/countries"
import { TIMEZONES, getDetectedTimezone } from "@/lib/constants/timezones"
import { PAYOUT_METHODS } from "@/lib/constants/payout-methods"

export default function SignUpPage() {
  const [roleSelection, setRoleSelection] = useState<UserRole | null>(null)

  // Personal info
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Contact & location
  const [phoneNumber, setPhoneNumber] = useState("")
  const [country, setCountry] = useState("")
  const [timezone, setTimezone] = useState(getDetectedTimezone())

  // Reviewer-specific
  const [payoutMethod, setPayoutMethod] = useState("")

  // Legal
  const [tosAccepted, setTosAccepted] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)

  const [error, setError] = useState("")
  const { signUp, loading } = useAuth()
  const router = useRouter()

  const handleSignUp = async () => {
    // Validation
    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all required fields")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    if (!country) {
      setError("Please select your country")
      return
    }
    if (!timezone) {
      setError("Please select your timezone")
      return
    }
    if (!tosAccepted) {
      setError("You must accept the Terms of Service to continue")
      return
    }
    if (roleSelection === "REVIEWER" && !payoutMethod) {
      setError("Please select your preferred payout method")
      return
    }

    try {
      trackEvent(`${roleSelection?.toLowerCase()}_signup_started`)
      await signUp({
        email,
        password,
        role: roleSelection!,
        firstName,
        lastName,
        phoneNumber: phoneNumber || undefined,
        country,
        timezone,
        tosAccepted,
        marketingConsent,
        preferredPayoutMethod: roleSelection === "REVIEWER"
          ? payoutMethod as 'PAYPAL' | 'BANK_TRANSFER' | 'STRIPE_CONNECT'
          : undefined,
      })
      trackEvent(`${roleSelection?.toLowerCase()}_signup_completed`)

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
              <h3 className="font-semibold text-foreground mb-1">I&apos;m a Creator</h3>
              <p className="text-sm text-muted-foreground">I want feedback on my content before publishing</p>
            </button>

            <button
              onClick={() => setRoleSelection("REVIEWER")}
              className="w-full p-4 border border-border rounded-lg hover:bg-secondary transition-colors text-left"
            >
              <h3 className="font-semibold text-foreground mb-1">I&apos;m a Reviewer</h3>
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
            &larr; Back
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
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Personal Information</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="mt-1"
              />
            </div>
          </div>

          {/* Contact & Location */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Contact & Location</h3>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="country">Country *</Label>
              <Select value={country} onValueChange={setCountry} disabled={loading}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timezone">Timezone *</Label>
              <Select value={timezone} onValueChange={setTimezone} disabled={loading}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reviewer-only: Payout Preferences */}
          {roleSelection === "REVIEWER" && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Payout Preferences</h3>

              <div>
                <Label htmlFor="payoutMethod">Preferred Payout Method *</Label>
                <Select value={payoutMethod} onValueChange={setPayoutMethod} disabled={loading}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="How would you like to be paid?" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYOUT_METHODS.map((pm) => (
                      <SelectItem key={pm.value} value={pm.value}>
                        <div>
                          <div>{pm.label}</div>
                          <div className="text-xs text-muted-foreground">{pm.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Legal */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="tos"
                checked={tosAccepted}
                onCheckedChange={(checked) => setTosAccepted(checked === true)}
                disabled={loading}
              />
              <Label htmlFor="tos" className="text-sm leading-relaxed cursor-pointer">
                I accept the{" "}
                <Link href="/legal/terms" className="text-accent hover:underline" target="_blank">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/legal/privacy" className="text-accent hover:underline" target="_blank">
                  Privacy Policy
                </Link>{" "}
                *
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="marketing"
                checked={marketingConsent}
                onCheckedChange={(checked) => setMarketingConsent(checked === true)}
                disabled={loading}
              />
              <Label htmlFor="marketing" className="text-sm leading-relaxed cursor-pointer">
                I agree to receive marketing emails and product updates
              </Label>
            </div>
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
