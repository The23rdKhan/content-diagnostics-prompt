import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/marketing/header"
import { Footer } from "@/components/marketing/footer"
import { ArrowRight, CheckCircle, Upload } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "For Creators | Content Diagnostics",
  description:
    "Content Diagnostics helps creators, educators, and organizations review video content before publishing. Improve clarity, pacing, and structure without risking public performance.",
}

export default function ForCreatorsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
                Video Content Feedback for Creators and Teams
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-pretty">
                Content Diagnostics helps creators, educators, and organizations review video content before publishing.
                Upload your video to receive structured feedback from AI analysis and paid human reviewers. Improve
                clarity, pacing, and structure without risking public performance.
              </p>
              <div className="mt-10">
                <Button size="lg" asChild>
                  <Link href="/auth/sign-up">
                    <Upload className="mr-2 h-4 w-4" />
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Why Use Section */}
        <section className="py-20 lg:py-32 bg-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-card-foreground text-center mb-12">Why Use Content Diagnostics</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                "Identify confusing sections before publishing",
                "Detect pacing and engagement issues early",
                "Receive structured, unbiased feedback",
                "Test content ethically and privately",
                "Publish with confidence",
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 rounded-lg border border-border bg-background p-4">
                  <CheckCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Report Preview */}
        <section className="py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Comprehensive Feedback Reports</h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Each report provides actionable insights to improve your content before release.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "Executive summary",
                    "Clarity, pacing, and engagement indicators",
                    "Timeline-based feedback",
                    "AI diagnostics (clearly labeled)",
                    "Aggregated human feedback",
                    "Actionable recommendations",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <ArrowRight className="h-4 w-4 text-accent" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-8 text-sm text-muted-foreground italic">
                  Feedback is for internal testing and improvement purposes only.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="space-y-4">
                  <div className="rounded-lg bg-secondary p-4">
                    <h4 className="text-sm font-semibold text-secondary-foreground">Executive Summary</h4>
                    <p className="mt-2 text-sm text-muted-foreground">Overall clarity score: 78/100</p>
                  </div>
                  <div className="rounded-lg bg-secondary p-4">
                    <h4 className="text-sm font-semibold text-secondary-foreground">Engagement Analysis</h4>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-3/4 rounded-full bg-accent" />
                    </div>
                  </div>
                  <div className="rounded-lg bg-secondary p-4">
                    <h4 className="text-sm font-semibold text-secondary-foreground">Key Recommendations</h4>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>• Simplify introduction at 0:30</li>
                      <li>• Add visual aid at 2:15</li>
                      <li>• Clarify call-to-action</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 lg:py-32 bg-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-card-foreground">Start testing your content today</h2>
              <p className="mt-4 text-muted-foreground">
                Upload your first video and receive structured feedback within hours.
              </p>
              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link href="/auth/sign-up">
                    <Upload className="mr-2 h-4 w-4" />
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
