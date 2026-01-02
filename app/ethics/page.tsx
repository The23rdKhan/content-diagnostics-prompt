import { Header } from "@/components/marketing/header"
import { Footer } from "@/components/marketing/footer"
import { CheckCircle, XCircle, Shield, Eye, Users, Lock } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Ethics & Transparency | Content Diagnostics",
  description: "Our commitment to ethical content testing and transparency in how Content Diagnostics works.",
}

export default function EthicsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-4">Ethics & Transparency</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We believe in honest, ethical content testing. Here&apos;s exactly what we do and don&apos;t do.
            </p>
          </div>

          {/* What We Are / What We Aren't */}
          <div className="grid gap-8 md:grid-cols-2 mb-16">
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                What We Are
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">A private testing tool</strong> — Get feedback before you publish
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Real human feedback</strong> — Paid reviewers watching your content
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">AI-powered analysis</strong> — Objective metrics on clarity and pacing
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Constructive feedback</strong> — Actionable insights to improve
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Confidential</strong> — Your content stays private
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <XCircle className="h-6 w-6 text-red-600" />
                What We Are NOT
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Not a view farm</strong> — We don&apos;t inflate public metrics
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Not algorithm manipulation</strong> — We don&apos;t game platforms
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Not fake engagement</strong> — No bots, no fake comments
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Not a promotion service</strong> — We test, not distribute
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Not against ToS</strong> — We comply with platform rules
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Our Principles */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Our Principles</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <Shield className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Honest Feedback</h3>
                </div>
                <p className="text-muted-foreground">
                  Reviewers are instructed to give truthful, constructive feedback. We don&apos;t filter out negative
                  opinions or only show you what you want to hear. The goal is improvement, not validation.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <Users className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Fair Reviewer Pay</h3>
                </div>
                <p className="text-muted-foreground">
                  Our reviewers are compensated fairly for their time. We believe in sustainable gig work
                  where people are paid appropriately for thoughtful, quality feedback.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <Lock className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Content Confidentiality</h3>
                </div>
                <p className="text-muted-foreground">
                  Your content is never shared publicly. Reviewers sign confidentiality agreements and are
                  prohibited from sharing, copying, or discussing reviewed content outside the platform.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <Eye className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Transparent Reporting</h3>
                </div>
                <p className="text-muted-foreground">
                  Reports clearly distinguish between AI analysis and human feedback. You always know
                  the source of each insight so you can weigh the feedback appropriately.
                </p>
              </div>
            </div>
          </div>

          {/* How Reviews Work */}
          <div className="rounded-xl border border-border bg-card p-8 mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">How Reviews Actually Work</h2>
            <div className="space-y-6 text-muted-foreground">
              <p>
                When you submit a video, it&apos;s securely uploaded to our servers. Our AI runs initial
                analysis for clarity, pacing, and structural patterns. Then, your video is assigned to
                qualified human reviewers based on your selected plan.
              </p>
              <p>
                Reviewers watch your content in a private viewing environment. They cannot download,
                screenshot, or share the video. They provide structured feedback through our interface,
                rating specific aspects and adding written observations.
              </p>
              <p>
                All feedback is anonymized — creators don&apos;t know which reviewer said what, and reviewers
                don&apos;t know who created the content. This separation ensures honest, unbiased feedback.
              </p>
              <p>
                After the review window closes, we compile everything into a single report. You receive
                aggregate scores, individual comments, timeline-based feedback, and prioritized action items.
              </p>
            </div>
          </div>

          {/* Prohibited Content */}
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Content We Don&apos;t Accept</h2>
            <p className="text-muted-foreground mb-4">
              To protect our reviewers and maintain platform integrity, we do not accept:
            </p>
            <ul className="grid gap-3 md:grid-cols-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive shrink-0" />
                Illegal content of any kind
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive shrink-0" />
                Hate speech or harassment
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive shrink-0" />
                Non-consensual intimate content
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive shrink-0" />
                Content exploiting minors
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive shrink-0" />
                Graphic violence or gore
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive shrink-0" />
                Dangerous misinformation
              </li>
            </ul>
            <p className="text-muted-foreground mt-6 text-sm">
              Content violating these guidelines will be removed, and accounts may be terminated.
              Reviewers are trained to report violations immediately.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
