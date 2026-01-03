import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/marketing/header"
import { Footer } from "@/components/marketing/footer"
import { Check } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing | Content Diagnostics",
  description:
    "Choose a subscription plan that fits your needs. Each tier guarantees a minimum number of paid human reviewers per video.",
}

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "$49",
      period: "/month",
      description: "For individual creators testing content",
      reviewers: "5",
      features: [
        "5 reviewers per video",
        "AI diagnostics included",
        "Asynchronous human feedback",
        "48-hour turnaround",
        "Basic reports",
      ],
      cta: "Get Started",
      featured: false,
    },
    {
      name: "Pro",
      price: "$149",
      period: "/month",
      description: "For teams and regular content testing",
      reviewers: "10",
      features: [
        "10 reviewers per video",
        "AI diagnostics included",
        "Asynchronous human feedback",
        "24-hour turnaround",
        "Detailed reports",
        "Priority support",
      ],
      cta: "Get Started",
      featured: true,
    },
    {
      name: "Studio",
      price: "$399",
      period: "/month",
      description: "For organizations with high-volume needs",
      reviewers: "15",
      features: [
        "15 reviewers per video",
        "AI diagnostics included",
        "Asynchronous human feedback",
        "12-hour turnaround",
        "Comprehensive reports",
        "Dedicated support",
        "Custom reviewer pools",
      ],
      cta: "Contact Sales",
      featured: false,
    },
  ]

  const addons = [
    {
      name: "Additional Reviewers",
      description: "Add more reviewers to any submission",
      price: "$1.50 per reviewer",
    },
    {
      name: "Faster Delivery",
      description: "Expedite your feedback turnaround",
      price: "Starting at $25",
    },
    {
      name: "Full-Watch Summary",
      description: "Extended reviewer summaries for longer content",
      price: "$15 per video",
    },
    {
      name: "Live Feedback Session",
      description: "Real-time feedback from reviewers (availability-based)",
      price: "Starting at $99",
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
                Simple, Transparent Pricing
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Each subscription tier guarantees a minimum number of paid human reviewers per video.
              </p>
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="py-20 lg:py-32 bg-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-xl border p-8 ${
                    plan.featured ? "border-accent bg-accent/5" : "border-border bg-background"
                  }`}
                >
                  {plan.featured && (
                    <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground mb-4">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <div className="mt-4 rounded-lg bg-secondary p-3">
                    <p className="text-sm text-secondary-foreground">
                      <strong>{plan.reviewers}</strong> reviewers per video
                    </p>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-accent" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-8" variant={plan.featured ? "default" : "outline"} asChild>
                    <Link href="/auth/sign-up">{plan.cta}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Add-ons */}
        <section className="py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground">Optional Add-ons</h2>
              <p className="mt-4 text-muted-foreground">Enhance your reviews with additional features</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {addons.map((addon) => (
                <div key={addon.name} className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-card-foreground">{addon.name}</h3>
                    <span className="text-sm font-medium text-accent">{addon.price}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{addon.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ CTA */}
        <section className="py-20 lg:py-32 bg-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-card-foreground">Questions about pricing?</h2>
              <p className="mt-4 text-muted-foreground">
                Contact our team for custom enterprise solutions or volume discounts.
              </p>
              <div className="mt-8">
                <Button size="lg" variant="outline" asChild>
                  <Link href="/contact">Contact Sales</Link>
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
