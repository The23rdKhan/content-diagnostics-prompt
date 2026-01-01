import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/marketing/header"
import { Footer } from "@/components/marketing/footer"
import { ArrowRight, BarChart3, Clock, Download, FileText, Target, Users, CheckCircle2 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
                Get Actionable Feedback on Your Content Before You Publish
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-pretty">
                AI diagnostics and paid human reviewers help you improve clarity, pacing, and structure in a private
                testing environment.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" asChild>
                  <Link href="/auth/sign-up?role=creator">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/sample-report">View Sample Report</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 lg:py-32 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl text-balance">How It Works</h2>
              <p className="mt-4 text-lg text-muted-foreground">Five steps from upload to actionable insights</p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-5">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold">
                  1
                </div>
                <h3 className="mt-4 text-lg font-semibold text-card-foreground">Upload Video</h3>
                <p className="mt-2 text-sm text-muted-foreground">Select your video file and provide context</p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold">
                  2
                </div>
                <h3 className="mt-4 text-lg font-semibold text-card-foreground">AI Analysis</h3>
                <p className="mt-2 text-sm text-muted-foreground">Instant diagnostics on clarity and pacing</p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold">
                  3
                </div>
                <h3 className="mt-4 text-lg font-semibold text-card-foreground">Human Review</h3>
                <p className="mt-2 text-sm text-muted-foreground">Paid reviewers watch and provide feedback</p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold">
                  4
                </div>
                <h3 className="mt-4 text-lg font-semibold text-card-foreground">Report Generation</h3>
                <p className="mt-2 text-sm text-muted-foreground">Insights compiled into structured report</p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold">
                  5
                </div>
                <h3 className="mt-4 text-lg font-semibold text-card-foreground">Take Action</h3>
                <p className="mt-2 text-sm text-muted-foreground">Implement changes and republish</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl text-balance">What You Get</h2>
              <p className="mt-4 text-lg text-muted-foreground">Comprehensive feedback tools for content creators</p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-card-foreground">Timeline Insights</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  See exactly where reviewers lost focus or clarity dropped, mapped to specific timestamps
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <BarChart3 className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-card-foreground">Clarity Scores</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Quantified ratings for hook strength, pacing consistency, and structural coherence
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Target className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-card-foreground">Action Plan</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Prioritized recommendations with clear reasons and expected impact on viewer experience
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Download className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-card-foreground">Export Options</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Download reports as PDF or share via link with team members and editors
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 lg:py-32 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl text-balance">
                What early creators told us
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">Anonymized feedback from private pilot users</p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-sm text-card-foreground leading-relaxed">
                  "The timeline notes showed exactly where I started rambling — I fixed it in one edit."
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">YouTube creator</p>
                  <span className="rounded-full bg-accent/10 px-2 py-1 text-xs text-accent">Pacing</span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-sm text-card-foreground leading-relaxed">
                  "The action plan was the most useful part. Three changes, clear reasons, done."
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Course creator</p>
                  <span className="rounded-full bg-accent/10 px-2 py-1 text-xs text-accent">Action Plan</span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-sm text-card-foreground leading-relaxed">
                  "We used this to QA a training video before rollout. It caught clarity issues we missed internally."
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Ops team lead</p>
                  <span className="rounded-full bg-accent/10 px-2 py-1 text-xs text-accent">Clarity</span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-sm text-card-foreground leading-relaxed">
                  "The hook feedback was blunt, which is what I needed. The first 30 seconds are tighter now."
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Creator</p>
                  <span className="rounded-full bg-accent/10 px-2 py-1 text-xs text-accent">Hook</span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-sm text-card-foreground leading-relaxed">
                  "Seeing 'SLA at risk' early helped me decide to upgrade delivery for a launch deadline."
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Marketing manager</p>
                  <span className="rounded-full bg-accent/10 px-2 py-1 text-xs text-accent">Workflow</span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-sm text-card-foreground leading-relaxed">
                  "The human notes aligned with the AI findings more than I expected. Great for confidence."
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Creator</p>
                  <span className="rounded-full bg-accent/10 px-2 py-1 text-xs text-accent">Structure</span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-sm text-card-foreground leading-relaxed">
                  "The report format made it easy to hand edits to my editor without extra meetings."
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Studio owner</p>
                  <span className="rounded-full bg-accent/10 px-2 py-1 text-xs text-accent">Collaboration</span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-sm text-card-foreground leading-relaxed">
                  "It's like a preflight check for content. I don't publish without a quick run now."
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Creator</p>
                  <span className="rounded-full bg-accent/10 px-2 py-1 text-xs text-accent">Diagnostics</span>
                </div>
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-muted-foreground">Quotes are anonymized from pilot feedback.</p>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl text-balance">
                Who Uses Content Diagnostics
              </h2>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-8">
                <Users className="h-8 w-8 text-accent" />
                <h3 className="mt-4 text-xl font-semibold text-card-foreground">Creators</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Solo creators testing tutorials, vlogs, and educational content before publishing to ensure clarity
                  and engagement.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-8">
                <FileText className="h-8 w-8 text-accent" />
                <h3 className="mt-4 text-xl font-semibold text-card-foreground">Educators</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Course creators and instructors validating lesson structure and pacing before releasing to students.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-8">
                <CheckCircle2 className="h-8 w-8 text-accent" />
                <h3 className="mt-4 text-xl font-semibold text-card-foreground">Teams</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Marketing and ops teams QA-testing training videos, product demos, and internal communications.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ethics Callout */}
        <section className="py-20 lg:py-32 bg-muted/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-border bg-card p-8 lg:p-12">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-card-foreground sm:text-3xl text-balance">
                  Ethics & Transparency
                </h2>
                <div className="mt-6 space-y-4 text-left">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <strong className="text-card-foreground">Paid reviewers:</strong> All human feedback comes from
                      fairly compensated reviewers, not unpaid volunteers or exploitation.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <strong className="text-card-foreground">Internal testing only:</strong> This is a diagnostic
                      tool, not a view-boosting service. Content stays private.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <strong className="text-card-foreground">No hype claims:</strong> We focus on clarity and
                      structure, not promising viral growth or algorithm manipulation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl text-balance">
                Simple, Transparent Pricing
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">Choose the plan that fits your testing volume</p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-8">
                <h3 className="text-xl font-semibold text-card-foreground">Basic</h3>
                <p className="mt-2 text-3xl font-bold text-card-foreground">
                  $49<span className="text-lg text-muted-foreground">/mo</span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">3 reviews per month</p>
                <Button className="mt-6 w-full bg-transparent" variant="outline" asChild>
                  <Link href="/pricing">View Details</Link>
                </Button>
              </div>

              <div className="rounded-xl border-2 border-accent bg-card p-8 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground font-semibold">
                  Most Popular
                </div>
                <h3 className="text-xl font-semibold text-card-foreground">Professional</h3>
                <p className="mt-2 text-3xl font-bold text-card-foreground">
                  $149<span className="text-lg text-muted-foreground">/mo</span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">10 reviews per month</p>
                <Button className="mt-6 w-full" asChild>
                  <Link href="/pricing">View Details</Link>
                </Button>
              </div>

              <div className="rounded-xl border border-border bg-card p-8">
                <h3 className="text-xl font-semibold text-card-foreground">Enterprise</h3>
                <p className="mt-2 text-3xl font-bold text-card-foreground">Custom</p>
                <p className="mt-2 text-sm text-muted-foreground">Unlimited reviews</p>
                <Button className="mt-6 w-full bg-transparent" variant="outline" asChild>
                  <Link href="/pricing">View Details</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 lg:py-32 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-border bg-card p-8 lg:p-12">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold text-card-foreground sm:text-4xl text-balance">
                  Test content. Improve clarity. Publish with confidence.
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Start getting actionable feedback on your content in minutes.
                </p>
                <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <Button size="lg" asChild>
                    <Link href="/auth/sign-up?role=creator">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/sample-report">View Sample Report</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
