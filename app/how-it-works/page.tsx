import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/marketing/header"
import { Footer } from "@/components/marketing/footer"
import { ArrowRight } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "How It Works | Content Diagnostics",
  description:
    "Learn how Content Diagnostics helps you test video content before publishing using AI diagnostics and paid human reviewers.",
}

export default function HowItWorksPage() {
  const steps = [
    {
      number: "01",
      title: "Upload a pre-recorded video",
      description: "Submit your video content through the creator dashboard. We support most common video formats.",
    },
    {
      number: "02",
      title: "AI diagnostics run instantly",
      description: "Our AI analyzes your content for clarity, pacing, and engagement patterns within seconds.",
    },
    {
      number: "03",
      title: "Paid human reviewers complete feedback tasks",
      description: "Real reviewers watch your content and provide structured feedback based on specific criteria.",
    },
    {
      number: "04",
      title: "Feedback is aggregated into a single report",
      description: "All insights are compiled into a comprehensive report with actionable recommendations.",
    },
    {
      number: "05",
      title: "Optional add-ons available for deeper review",
      description: "Enhance your review with additional reviewers, faster delivery, or live feedback sessions.",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
                How Content Diagnostics Works
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                A simple, five-step process to get actionable feedback on your content before you publish.
              </p>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-20 lg:py-32 bg-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border bg-background">
                    <span className="text-lg font-bold text-accent">{step.number}</span>
                  </div>
                  <div className="flex-1 rounded-xl border border-border bg-background p-6">
                    <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Note */}
        <section className="py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                <strong className="text-card-foreground">Note:</strong> All reviewers are paid. Feedback is internal and
                for testing purposes only.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 lg:py-32 bg-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-card-foreground">Ready to get started?</h2>
              <p className="mt-4 text-muted-foreground">Choose your path and start improving your content today.</p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" asChild>
                  <Link href="/for-creators">
                    I want feedback
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/for-reviewers">I want to review</Link>
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
