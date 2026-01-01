import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/marketing/header"
import { Footer } from "@/components/marketing/footer"
import { AlertCircle, Clock, DollarSign, Globe, Play } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "For Reviewers | Content Diagnostics",
  description:
    "Get paid to review short videos online. Choose tasks from a queue, work when you want, and earn money providing honest feedback.",
}

export default function ForReviewersPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
                Get Paid to Review Short Videos Online
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-pretty">
                Content Diagnostics offers paid review tasks where participants watch short video segments and provide
                honest feedback. Tasks are optional, paid per task, and available globally.
              </p>
              <div className="mt-10">
                <Button size="lg" asChild>
                  <Link href="/auth/sign-up">Create Reviewer Account</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 lg:py-32 bg-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-card-foreground text-center mb-12">How It Works</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-background p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <Play className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">Choose Tasks</h3>
                <p className="mt-2 text-sm text-muted-foreground">Select from available tasks in your queue</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">Quick Tasks</h3>
                <p className="mt-2 text-sm text-muted-foreground">Typical task: 3 minutes for $0.30</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <Globe className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">Work Anywhere</h3>
                <p className="mt-2 text-sm text-muted-foreground">No schedules, work when you want</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <DollarSign className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">Get Paid</h3>
                <p className="mt-2 text-sm text-muted-foreground">Quality feedback earns reliable payments</p>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Rules */}
        <section className="py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <div className="rounded-xl border border-border bg-card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <AlertCircle className="h-6 w-6 text-accent" />
                  <h2 className="text-xl font-bold text-card-foreground">Payment Rules</h2>
                </div>
                <p className="text-muted-foreground mb-4">Quality matters. You may not be paid if:</p>
                <ul className="space-y-3">
                  {[
                    "Content is skipped",
                    "Feedback is rushed or irrelevant",
                    "Instructions are ignored",
                    "Repeated low-quality submissions occur",
                  ].map((rule, index) => (
                    <li key={index} className="flex items-center gap-3 text-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Task Preview */}
        <section className="py-20 lg:py-32 bg-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-card-foreground text-center mb-12">Sample Task Card</h2>
            <div className="mx-auto max-w-md">
              <div className="rounded-xl border border-border bg-background p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Video Segment</span>
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">$0.30</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Length</span>
                    <span className="text-foreground">2:45</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Language</span>
                    <span className="text-foreground">English</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. Time</span>
                    <span className="text-foreground">~3 minutes</span>
                  </div>
                </div>
                <Button className="w-full mt-6">Start Task</Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-foreground">Ready to start earning?</h2>
              <p className="mt-4 text-muted-foreground">
                Create your reviewer account and start completing paid tasks today.
              </p>
              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link href="/auth/sign-up">Create Reviewer Account</Link>
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
