import Link from "next/link"
import { Header } from "@/components/marketing/header"
import { Footer } from "@/components/marketing/footer"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, Globe, ArrowRight } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Supported Languages | Content Diagnostics",
  description: "Languages supported for content review on Content Diagnostics.",
}

export default function LanguagesPage() {
  const availableLanguages = [
    { name: "English", code: "en", status: "available", reviewers: "500+" },
  ]

  const comingSoonLanguages = [
    { name: "Spanish", code: "es" },
    { name: "French", code: "fr" },
    { name: "German", code: "de" },
    { name: "Portuguese", code: "pt" },
    { name: "Japanese", code: "ja" },
    { name: "Korean", code: "ko" },
    { name: "Mandarin Chinese", code: "zh" },
    { name: "Hindi", code: "hi" },
    { name: "Arabic", code: "ar" },
    { name: "Italian", code: "it" },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <Globe className="h-8 w-8 text-accent" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Supported Languages</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Content Diagnostics matches your videos with reviewers who are fluent in your
              content&apos;s language for accurate, nuanced feedback.
            </p>
          </div>

          {/* Available Languages */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Available Now</h2>
            <div className="grid gap-4">
              {availableLanguages.map((lang) => (
                <div
                  key={lang.code}
                  className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent/5 p-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                      <CheckCircle className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{lang.name}</h3>
                      <p className="text-sm text-muted-foreground">{lang.reviewers} qualified reviewers</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-accent/20 px-4 py-1 text-sm font-medium text-accent">
                    Available
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Coming Soon */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Coming Soon</h2>
            <p className="text-muted-foreground mb-6">
              We&apos;re actively expanding our reviewer network to support more languages.
              Join the waitlist to be notified when your language becomes available.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {comingSoonLanguages.map((lang) => (
                <div
                  key={lang.code}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
                >
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">{lang.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Request Language */}
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-xl font-bold text-foreground mb-4">Don&apos;t See Your Language?</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              We prioritize new languages based on demand. Let us know what language you need,
              and we&apos;ll work to add qualified reviewers for it.
            </p>
            <Button asChild>
              <a href="mailto:support@contentdiagnostics.com?subject=Language Request">
                Request a Language
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>

          {/* For Reviewers */}
          <div className="mt-16 rounded-xl border border-accent/30 bg-accent/5 p-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Are You a Multilingual Reviewer?</h2>
            <p className="text-muted-foreground mb-6">
              We&apos;re looking for fluent speakers in all languages to join our reviewer network.
              Help content creators around the world improve their videos and get paid for your expertise.
            </p>
            <Button asChild variant="outline">
              <Link href="/for-reviewers">
                Become a Reviewer
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
