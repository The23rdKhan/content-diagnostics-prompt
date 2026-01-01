"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { trackEvent } from "@/lib/analytics"
import { Upload, FileText, ArrowRight } from "lucide-react"

export default function CreatorWelcome() {
  const [confirmedOnboarding, setConfirmedOnboarding] = useState(false)
  const router = useRouter()

  const handleStartUploading = () => {
    trackEvent("upload_started")
    router.push("/creators/dashboard")
  }

  const handleViewSampleReport = () => {
    router.push("/creators/dashboard?view=sample-report")
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <span>1. Plan Selection → 2. Checkout →</span>
            <span className="text-foreground">3. Welcome</span>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-4">Welcome! You're All Set</h1>
          <p className="text-lg text-muted-foreground">
            Your account is ready. Let's get started with your first video submission.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* What to do next */}
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2">
                <Upload className="h-5 w-5 text-accent" />
                Upload Your First Video
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Upload a video and get feedback from real human reviewers. We'll analyze clarity, pacing, and engagement
                patterns.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Supported formats: MP4, MOV, WebM</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Max file size: 5GB</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Any duration accepted</span>
                </li>
              </ul>
              <Button onClick={handleStartUploading} className="w-full">
                Upload Video
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* How it works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2">
                <FileText className="h-5 w-5 text-accent" />
                See a Sample Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Not sure what to expect? View a sample report showing how we structure feedback and analyze your
                content.
              </p>
              <div className="space-y-2 text-sm">
                <p className="font-medium">Sample Report Includes:</p>
                <ul className="space-y-1">
                  <li className="flex gap-2">
                    <span className="text-accent">✓</span>
                    <span>AI clarity diagnostics</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">✓</span>
                    <span>Timeline-based feedback</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">✓</span>
                    <span>Aggregated reviewer insights</span>
                  </li>
                </ul>
              </div>
              <Button variant="outline" onClick={handleViewSampleReport} className="w-full bg-transparent">
                View Sample Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Next steps */}
        <Card>
          <CardHeader>
            <CardTitle>What Happens Next</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">Upload Your Content</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Submit your video from the dashboard. You'll get a confirmation immediately.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">AI Analysis Runs</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Within minutes, our AI will analyze your content for clarity, pacing, and engagement.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">Reviewers Provide Feedback</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your assigned paid human reviewers watch your video and provide detailed feedback.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-semibold">Get Your Report</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receive a comprehensive report with aggregated insights and actionable recommendations.
                  </p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
