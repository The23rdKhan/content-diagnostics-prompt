import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/marketing/header"
import { Footer } from "@/components/marketing/footer"
import { ArrowRight, ArrowLeft, Download, Share2, BarChart3, Clock, AlertCircle, CheckCircle2 } from "lucide-react"

export default function SampleReportPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share Link
              </Button>
            </div>
          </div>

          {/* Report Header */}
          <div className="rounded-xl border border-border bg-card p-8 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">How to Create Engaging Tutorial Videos</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Video Length: 8:42 • Language: English • Completed: Jan 15, 2025
                </p>
              </div>
              <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                Delivered
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-accent" />
                  <p className="text-xs text-muted-foreground">Overall Score</p>
                </div>
                <p className="mt-2 text-2xl font-bold text-card-foreground">7.8/10</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent" />
                  <p className="text-xs text-muted-foreground">Reviewers</p>
                </div>
                <p className="mt-2 text-2xl font-bold text-card-foreground">3 human</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <p className="text-xs text-muted-foreground">SLA</p>
                </div>
                <p className="mt-2 text-2xl font-bold text-card-foreground">2h early</p>
              </div>
            </div>
          </div>

          {/* Key Findings */}
          <div className="rounded-xl border border-border bg-card p-8 mb-8">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">Key Findings</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">Strong Hook (9/10)</p>
                  <p className="text-sm text-muted-foreground">
                    First 30 seconds clearly establish value and capture attention
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">Pacing Issue at 3:20-4:40 (5/10)</p>
                  <p className="text-sm text-muted-foreground">
                    Explanation becomes repetitive; reviewers noted attention drop
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">Clear Structure (8/10)</p>
                  <p className="text-sm text-muted-foreground">Logical progression from intro to demo to conclusion</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Feedback */}
          <div className="rounded-xl border border-border bg-card p-8 mb-8">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">Timeline Feedback</h2>
            <div className="space-y-4">
              <div className="border-l-2 border-accent pl-4">
                <p className="text-xs text-muted-foreground mb-1">0:00 - 0:30</p>
                <p className="text-sm text-card-foreground">
                  "Great opening! Immediately told me what I'll learn and why it matters."
                </p>
                <p className="text-xs text-muted-foreground mt-1">— Reviewer 1</p>
              </div>
              <div className="border-l-2 border-yellow-500 pl-4">
                <p className="text-xs text-muted-foreground mb-1">3:20 - 4:40</p>
                <p className="text-sm text-card-foreground">
                  "This section felt repetitive. You explained the same concept three different ways without adding new
                  information."
                </p>
                <p className="text-xs text-muted-foreground mt-1">— Reviewer 2</p>
              </div>
              <div className="border-l-2 border-accent pl-4">
                <p className="text-xs text-muted-foreground mb-1">5:15 - 6:30</p>
                <p className="text-sm text-card-foreground">
                  "The demo was clear and easy to follow. Liked the step-by-step approach."
                </p>
                <p className="text-xs text-muted-foreground mt-1">— Reviewer 3</p>
              </div>
              <div className="border-l-2 border-accent pl-4">
                <p className="text-xs text-muted-foreground mb-1">8:10 - 8:42</p>
                <p className="text-sm text-card-foreground">
                  "Good recap, but could be shorter. Main points were already clear."
                </p>
                <p className="text-xs text-muted-foreground mt-1">— Reviewer 1</p>
              </div>
            </div>
          </div>

          {/* Action Plan */}
          <div className="rounded-xl border border-border bg-card p-8 mb-8">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">Action Plan</h2>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-card-foreground">1. Trim 3:20-4:40 section</p>
                  <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs text-red-600 dark:text-red-400">
                    High Priority
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Remove redundant explanations. Keep one clear example and move on. Expected impact: +1.5 points on
                  pacing score.
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-card-foreground">2. Shorten conclusion to 20 seconds</p>
                  <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-xs text-yellow-600 dark:text-yellow-400">
                    Medium Priority
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Recap is too long. Hit main points and end. Expected impact: Tighter overall structure.
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-card-foreground">3. Consider adding chapter markers</p>
                  <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs text-blue-600 dark:text-blue-400">
                    Low Priority
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Optional enhancement for viewer navigation. Not critical for current content.
                </p>
              </div>
            </div>
          </div>

          {/* AI Diagnostics */}
          <div className="rounded-xl border border-border bg-card p-8 mb-8">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">AI Diagnostics</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Clarity Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-accent" style={{ width: "82%" }} />
                  </div>
                  <p className="text-sm font-medium text-card-foreground">8.2/10</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Pacing Consistency</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-yellow-500" style={{ width: "64%" }} />
                  </div>
                  <p className="text-sm font-medium text-card-foreground">6.4/10</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Audio Quality</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-accent" style={{ width: "90%" }} />
                  </div>
                  <p className="text-sm font-medium text-card-foreground">9.0/10</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Visual Engagement</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-accent" style={{ width: "76%" }} />
                  </div>
                  <p className="text-sm font-medium text-card-foreground">7.6/10</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-xl border border-accent/50 bg-accent/5 p-8 text-center">
            <h2 className="text-xl font-semibold text-card-foreground">Ready to test your content?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Get detailed feedback like this for your videos in 24-48 hours
            </p>
            <Button size="lg" className="mt-6" asChild>
              <Link href="/auth/sign-up?role=creator">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
