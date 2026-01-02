"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { User, Bell, CreditCard, Receipt, ChevronRight } from "lucide-react"

const settingsLinks = [
  {
    title: "Profile",
    description: "Edit your name, profile picture, and banner image",
    href: "/creators/profile",
    icon: User,
  },
  {
    title: "Notifications",
    description: "Manage your email notification preferences",
    href: "/creators/settings/notifications",
    icon: Bell,
  },
  {
    title: "Subscription",
    description: "View and manage your subscription plan",
    href: "/creators/subscription",
    icon: CreditCard,
  },
  {
    title: "Billing",
    description: "View invoices and manage payment methods",
    href: "/creators/billing",
    icon: Receipt,
  },
]

export default function CreatorSettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/creators/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            &larr; Back to Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="grid gap-4">
          {settingsLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="hover:bg-secondary/50 transition-colors cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                        <link.icon className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{link.title}</CardTitle>
                        <CardDescription className="text-sm">{link.description}</CardDescription>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
