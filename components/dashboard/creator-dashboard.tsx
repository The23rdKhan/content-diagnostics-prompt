"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Upload, FileVideo, BarChart3, CreditCard, Plus, HelpCircle, LogOut, Menu, X, Clock, Coins } from "lucide-react"
import { UploadSection } from "./creator/upload-section"
import { ReviewStatusSection } from "./creator/review-status-section"
import { ReportsSection } from "./creator/reports-section"
import { SubscriptionSection } from "./creator/subscription-section"
import { AddonsSection } from "./creator/addons-section"
import { BillingSection } from "./creator/billing-section"
import { SupportSection } from "./creator/support-section"
import { CreditsSection } from "./creator/credits-section"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationBell } from "@/components/notification-bell"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { useAuth } from "@/lib/auth-context"
import { LoadingScreen } from "@/components/loading-screen"

type ActiveSection = "upload" | "status" | "reports" | "credits" | "subscription" | "addons" | "billing" | "support"

const navItems = [
  { id: "upload" as const, label: "Upload Video", icon: Upload },
  { id: "status" as const, label: "Review Status", icon: Clock },
  { id: "reports" as const, label: "Reports", icon: BarChart3 },
  { id: "credits" as const, label: "Credits", icon: Coins },
  { id: "subscription" as const, label: "Subscription", icon: CreditCard },
  { id: "addons" as const, label: "Add-ons", icon: Plus },
  { id: "billing" as const, label: "Billing", icon: FileVideo },
  { id: "support" as const, label: "Support", icon: HelpCircle },
]

export function CreatorDashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("upload")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/sign-in")
    }
  }, [loading, user, router])

  // Show loading state while auth is bootstrapping or redirecting
  if (loading || !user) {
    return <LoadingScreen />
  }

  // Format plan tier for display - map tier IDs to display names
  const getPlanDisplay = () => {
    const planTier = user?.creatorProfile?.planTier?.toLowerCase()
    if (!planTier) return "Free Plan"

    // Map tier IDs to display names (matching PlanSelector)
    const planNames: Record<string, string> = {
      basic: "Starter",
      professional: "Pro",
      enterprise: "Studio",
    }

    return (planNames[planTier] || planTier.charAt(0).toUpperCase() + planTier.slice(1)) + " Plan"
  }

  const renderSection = () => {
    switch (activeSection) {
      case "upload":
        return <UploadSection />
      case "status":
        return <ReviewStatusSection />
      case "reports":
        return <ReportsSection />
      case "credits":
        return <CreditsSection />
      case "subscription":
        return <SubscriptionSection />
      case "addons":
        return <AddonsSection />
      case "billing":
        return <BillingSection />
      case "support":
        return <SupportSection />
      default:
        return <UploadSection />
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-card transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link href="/creators/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <span className="text-sm font-bold text-accent-foreground">CD</span>
            </div>
            <span className="font-semibold text-card-foreground">Creator Portal</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id)
                setSidebarOpen(false)
              }}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                activeSection === item.id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" asChild>
            <Link href="/creators/dashboard">
              <LogOut className="h-4 w-4" />
              Dashboard Home
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-card-foreground">
            {navItems.find((item) => item.id === activeSection)?.label}
          </h1>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <ThemeToggle />
            <ProfileDropdown subtitle={getPlanDisplay()} />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">{renderSection()}</main>
      </div>
    </div>
  )
}
