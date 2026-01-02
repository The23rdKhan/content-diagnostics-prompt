"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Plus, Users, Zap, FileText, Video, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeToggle } from "@/components/theme-toggle"

const addons = [
  {
    id: "reviewers",
    name: "Additional Reviewers",
    description: "Add more reviewers to any submission for deeper insights",
    price: "$1.50",
    unit: "per reviewer",
    icon: Users,
  },
  {
    id: "delivery",
    name: "Faster Delivery",
    description: "Expedite your feedback turnaround to 12 hours",
    price: "$25",
    unit: "per video",
    icon: Zap,
  },
  {
    id: "summary",
    name: "Full-Watch Summary",
    description: "Extended reviewer summaries for longer content",
    price: "$15",
    unit: "per video",
    icon: FileText,
  },
  {
    id: "live",
    name: "Live Feedback Session",
    description: "Real-time feedback from reviewers (availability-based)",
    price: "$99",
    unit: "per session",
    icon: Video,
  },
]

export default function CreatorBilling() {
  const [invoices] = useState([
    {
      id: "INV-2025-001",
      date: "Jan 1, 2025",
      amount: "$49.00",
      status: "paid",
      description: "Professional Plan - Video Review",
      details: "1 video submission × $49",
    },
    {
      id: "INV-2024-012",
      date: "Dec 15, 2024",
      amount: "$74.00",
      status: "paid",
      description: "Professional Plan + Extra Reviewers",
      details: "1 video submission × $49 + Extra Reviewers × $25",
    },
    {
      id: "INV-2024-011",
      date: "Dec 1, 2024",
      amount: "$49.00",
      status: "paid",
      description: "Professional Plan - Video Review",
      details: "1 video submission × $49",
    },
  ])

  const [paymentMethod] = useState({
    type: "card",
    last4: "4242",
    expiry: "12/26",
    brand: "Visa",
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/creators/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Mode Banner */}
        <div className="mb-6 rounded-lg border-2 border-dashed border-amber-500/50 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">!</span>
            <div>
              <p className="font-semibold text-amber-700 dark:text-amber-400">Demo Mode</p>
              <p className="text-sm text-amber-600 dark:text-amber-500">
                This is a preview of the billing interface. No real charges will be applied.
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2">Billing & Payments</h1>
        <p className="text-muted-foreground mb-8">Manage your payment method, purchase add-ons, and view invoices.</p>

        <div className="grid gap-6 lg:grid-cols-3 mb-12">
          {/* Payment Method Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Method</p>
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <span className="text-2xl">💳</span>
                  <span>
                    {paymentMethod.brand} ending in {paymentMethod.last4}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Expires {paymentMethod.expiry}</p>
              </div>

              <Button variant="outline" className="w-full bg-transparent">
                Update Payment Method
              </Button>

              <Button variant="outline" className="w-full bg-transparent">
                <Plus className="mr-2 h-4 w-4" />
                Add Another Card
              </Button>
            </CardContent>
          </Card>

          {/* Account Balance */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-foreground">$172.00</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Submissions</p>
                <p className="text-2xl font-bold text-accent">3</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subscription Status</p>
                <Badge className="mt-1">Active</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Billing Alerts */}
          <Alert className="lg:col-span-1 h-fit">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold mb-2">Billing Alerts</p>
              <p className="text-sm">You'll be notified via email before any charges are applied to your account.</p>
            </AlertDescription>
          </Alert>
        </div>

        {/* Add-ons Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Available Add-ons</CardTitle>
            <CardDescription>Enhance your video reviews with additional features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {addons.map((addon) => (
                <div
                  key={addon.id}
                  className="rounded-lg border border-border p-4 hover:border-accent/50 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 mb-3">
                    <addon.icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground">{addon.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-3">{addon.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-accent">{addon.price}</span>
                      <span className="text-xs text-muted-foreground ml-1">{addon.unit}</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>View and download your past invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{invoice.description}</p>
                      <Badge variant={invoice.status === "paid" ? "default" : "outline"}>
                        {invoice.status === "paid" ? "Paid" : "Pending"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{invoice.details}</p>
                    <p className="text-xs text-muted-foreground mt-1">{invoice.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-accent">{invoice.amount}</p>
                    <Button variant="ghost" size="sm" className="mt-2">
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Alert className="mt-6 bg-accent/5 border-accent/30">
          <AlertCircle className="h-4 w-4 text-accent" />
          <AlertDescription className="text-accent">
            <p className="text-sm">
              This is a demonstration of the billing interface. No real charges will be applied. All transactions shown
              are mock data for testing purposes.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
