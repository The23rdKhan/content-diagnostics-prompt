"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ThemeToggle } from "@/components/theme-toggle"
import { trackEvent } from "@/lib/analytics"
import { ArrowRight } from "lucide-react"

export default function ReviewerRules() {
  const [rulesAccepted, setRulesAccepted] = useState(false)
  const [detailedAcknowledgement, setDetailedAcknowledgement] = useState(false)
  const router = useRouter()

  const handleAccept = () => {
    if (!rulesAccepted || !detailedAcknowledgement) {
      alert("Please accept all terms to continue")
      return
    }

    trackEvent("rules_accepted")
    sessionStorage.setItem("rules_accepted", "true")
    router.push("/reviewers/onboarding/language")
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
            <span className="text-foreground">1. Review Rules</span>
            <span>→ 2. Language → 3. Qualification</span>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-4">Review Our Guidelines</h1>
          <p className="text-lg text-muted-foreground">
            Before you can start reviewing, you must understand and accept our reviewer guidelines.
          </p>
        </div>

        <div className="space-y-6">
          {/* Rules cards */}
          <Card>
            <CardHeader>
              <CardTitle>Reviewer Code of Conduct</CardTitle>
              <CardDescription>These rules must be followed on every review task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Confidentiality</h4>
                <p className="text-sm text-muted-foreground">
                  All content you review is confidential. Never share, distribute, or discuss the videos or feedback
                  with anyone outside Content Diagnostics. Creator identities are never disclosed to you.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Honest & Unbiased Feedback</h4>
                <p className="text-sm text-muted-foreground">
                  Provide objective, constructive feedback. Focus on clarity, pacing, and engagement. Never criticize
                  the creator personally. Your feedback helps creators improve their content.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Complete Your Task</h4>
                <p className="text-sm text-muted-foreground">
                  When you accept a review task, you commit to watching the entire video and providing thorough feedback
                  within the assigned timeframe. Incomplete or low-effort reviews will result in payment deductions.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Prohibited Content</h4>
                <p className="text-sm text-muted-foreground">
                  If a video contains hate speech, illegal activity, or explicit content not disclosed, report it
                  immediately through the task interface. You will still receive payment for reporting.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Quality Standards</h4>
                <p className="text-sm text-muted-foreground">
                  Reviews with low quality, missing feedback, or generic responses may be declined, and you won't be
                  paid. We verify quality through sampling and creator reports.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Availability & Responsiveness</h4>
                <p className="text-sm text-muted-foreground">
                  If you accept a task, complete it by the deadline. Repeated missed deadlines or rejected reviews may
                  result in reduced task allocation or account suspension.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Legal */}
          <Card>
            <CardHeader>
              <CardTitle>Payment & Legal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                You will be paid per completed review task. Payment amounts vary based on video length, complexity, and
                your tier level. Payments are processed monthly to your selected payment method.
              </p>
              <p>
                By accepting, you confirm that you understand our Terms of Service and agree to abide by all guidelines.
                You also confirm that you are 18+ years old and authorized to work in your jurisdiction.
              </p>
              <p>
                Content Diagnostics reserves the right to suspend or terminate accounts that violate these guidelines.
              </p>
            </CardContent>
          </Card>

          {/* Acceptance checkboxes */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="rules"
                  checked={rulesAccepted}
                  onCheckedChange={(checked) => setRulesAccepted(checked as boolean)}
                  className="mt-1"
                />
                <label htmlFor="rules" className="text-sm cursor-pointer">
                  I have read and understand the Reviewer Code of Conduct and agree to follow these rules on all review
                  tasks.
                </label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="acknowledge"
                  checked={detailedAcknowledgement}
                  onCheckedChange={(checked) => setDetailedAcknowledgement(checked as boolean)}
                  className="mt-1"
                />
                <label htmlFor="acknowledge" className="text-sm cursor-pointer">
                  I acknowledge that violating these guidelines may result in payment deductions, task suspension, or
                  account termination.
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Continue button */}
          <div className="flex justify-end">
            <Button size="lg" onClick={handleAccept} disabled={!rulesAccepted || !detailedAcknowledgement}>
              Accept & Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
