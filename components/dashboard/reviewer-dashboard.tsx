"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play, History, DollarSign, CreditCard, Globe, HelpCircle, LogOut, Menu, X } from "lucide-react"
import { TaskQueueSection } from "./reviewer/task-queue-section"
import { TaskHistorySection } from "./reviewer/task-history-section"
import { EarningsSection } from "./reviewer/earnings-section"
import { PayoutSection } from "./reviewer/payout-section"
import { LanguageSection } from "./reviewer/language-section"
import { ReviewerSupportSection } from "./reviewer/reviewer-support-section"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationBell } from "@/components/notification-bell"

type ActiveSection = "queue" | "history" | "earnings" | "payout" | "language" | "support"

const navItems = [
  { id: "queue" as const, label: "Task Queue", icon: Play },
  { id: "history" as const, label: "Task History", icon: History },
  { id: "earnings" as const, label: "Earnings", icon: DollarSign },
  { id: "payout" as const, label: "Payout Settings", icon: CreditCard },
  { id: "language" as const, label: "Language Profile", icon: Globe },
  { id: "support" as const, label: "Support", icon: HelpCircle },
]

export function ReviewerDashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("queue")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderSection = () => {
    switch (activeSection) {
      case "queue":
        return <TaskQueueSection />
      case "history":
        return <TaskHistorySection />
      case "earnings":
        return <EarningsSection />
      case "payout":
        return <PayoutSection />
      case "language":
        return <LanguageSection />
      case "support":
        return <ReviewerSupportSection />
      default:
        return <TaskQueueSection />
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
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <span className="text-sm font-bold text-accent-foreground">CD</span>
            </div>
            <span className="font-semibold text-card-foreground">Reviewer Portal</span>
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
            <Link href="/">
              <LogOut className="h-4 w-4" />
              Back to Home
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-accent font-medium">$42.30 earned</span>
              <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-sm font-medium text-accent">AR</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">{renderSection()}</main>
      </div>
    </div>
  )
}
