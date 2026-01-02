"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { trackEvent } from "@/lib/analytics"
import { ArrowRight, Lock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingScreen } from "@/components/loading-screen"

export default function ReviewerLanguage() {
  const [proficiency, setProficiency] = useState<"native" | "fluent" | "intermediate">("fluent")
  const [isReady, setIsReady] = useState(false)
  const router = useRouter()

  // Guard: Ensure user has accepted rules before accessing language page
  useEffect(() => {
    const rulesAccepted = sessionStorage.getItem("rules_accepted")
    if (!rulesAccepted) {
      router.replace("/reviewers/onboarding/rules")
    } else {
      setIsReady(true)
    }
  }, [router])

  const proficiencyOptions = [
    { value: "native", label: "Native", description: "English is my first language" },
    { value: "fluent", label: "Fluent", description: "I speak English at a professional level" },
    { value: "intermediate", label: "Intermediate", description: "I can understand and review English content" },
  ]

  // Don't render until we've verified the prerequisite step was completed
  if (!isReady) {
    return <LoadingScreen />
  }

  const handleContinue = () => {
    trackEvent("language_selected", { language: "English", proficiency })
    sessionStorage.setItem("selected_language", "English")
    sessionStorage.setItem("proficiency", proficiency)
    router.push("/reviewers/onboarding/qualification")
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <span>1. Review Rules →</span>
            <span className="text-foreground">2. Language</span>
            <span>→ 3. Qualification</span>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-4">Language Profile</h1>
          <p className="text-lg text-muted-foreground">Set your language proficiency for the MVP launch</p>
        </div>

        <Alert className="mb-6 border-accent/30 bg-accent/5">
          <Lock className="h-4 w-4 text-accent" />
          <AlertDescription className="text-accent">You will only receive tasks in English for MVP.</AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>English Language Review</CardTitle>
            <CardDescription>Select your English proficiency level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 border-2 border-accent/30 rounded-lg bg-accent/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">English</span>
                    <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-white">Selected</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Primary review language for MVP</p>
                </div>
                <Lock className="h-5 w-5 text-accent" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Select Your English Proficiency</h3>
              <div className="space-y-3">
                {proficiencyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setProficiency(option.value as any)}
                    className={`w-full p-4 border rounded-lg text-left transition-colors ${
                      proficiency === option.value
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border-2 ${
                          proficiency === option.value ? "border-accent bg-accent" : "border-border"
                        }`}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Continue button */}
        <div className="flex justify-end mt-8">
          <Button size="lg" onClick={handleContinue}>
            Continue to Qualification
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
