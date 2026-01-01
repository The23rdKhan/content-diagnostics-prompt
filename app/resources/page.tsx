import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/marketing/header"
import { Footer } from "@/components/marketing/footer"
import { FileText, BookOpen, Video, HelpCircle } from "lucide-react"

export default function ResourcesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl text-balance">Resources</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Guides, documentation, and help for getting the most from Content Diagnostics
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6">
              <FileText className="h-8 w-8 text-accent" />
              <h3 className="mt-4 text-lg font-semibold text-card-foreground">Getting Started Guide</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Learn how to upload your first video and interpret your report
              </p>
              <Button variant="link" className="mt-4 p-0" asChild>
                <Link href="/resources/getting-started">Read guide →</Link>
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <BookOpen className="h-8 w-8 text-accent" />
              <h3 className="mt-4 text-lg font-semibold text-card-foreground">Documentation</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Comprehensive docs on features, pricing, and best practices
              </p>
              <Button variant="link" className="mt-4 p-0" asChild>
                <Link href="/resources/docs">Browse docs →</Link>
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <Video className="h-8 w-8 text-accent" />
              <h3 className="mt-4 text-lg font-semibold text-card-foreground">Video Tutorials</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Watch step-by-step tutorials on using the platform
              </p>
              <Button variant="link" className="mt-4 p-0" asChild>
                <Link href="/resources/tutorials">Watch tutorials →</Link>
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <HelpCircle className="h-8 w-8 text-accent" />
              <h3 className="mt-4 text-lg font-semibold text-card-foreground">FAQ</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Common questions about reviews, pricing, and turnaround times
              </p>
              <Button variant="link" className="mt-4 p-0" asChild>
                <Link href="/resources/faq">View FAQ →</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
