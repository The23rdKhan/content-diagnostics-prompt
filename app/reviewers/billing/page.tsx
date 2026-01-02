"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AlertCircle, ArrowLeft, CreditCard, Building, Check, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeToggle } from "@/components/theme-toggle"

export default function ReviewerBilling() {
  const [payoutMethod, setPayoutMethod] = useState<"paypal" | "bank">("paypal")
  const [isVerified] = useState(true)
  const [isSaved, setIsSaved] = useState(false)

  const [payouts] = useState([
    {
      id: "PAY-2025-001",
      date: "Jan 1, 2025",
      amount: "$42.30",
      status: "completed",
      method: "PayPal",
    },
    {
      id: "PAY-2024-012",
      date: "Dec 15, 2024",
      amount: "$38.50",
      status: "completed",
      method: "PayPal",
    },
    {
      id: "PAY-2024-011",
      date: "Dec 1, 2024",
      amount: "$45.00",
      status: "completed",
      method: "PayPal",
    },
  ])

  const handleSaveSettings = () => {
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/reviewers/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
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
                This is a preview of the payout interface. No real payouts will be processed.
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2">Payout & Billing</h1>
        <p className="text-muted-foreground mb-8">Manage your payout method and view payment history.</p>

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {/* Available Balance */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Available Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-bold text-accent">$42.30</p>
                <p className="text-sm text-muted-foreground mt-1">Ready for payout</p>
              </div>
              <Button className="w-full">Request Payout</Button>
            </CardContent>
          </Card>

          {/* Earnings Summary */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Earnings Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold text-foreground">$168.10</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-accent">$42.30</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reviews Completed</p>
                <p className="text-lg font-semibold">47</p>
              </div>
            </CardContent>
          </Card>

          {/* Payout Schedule */}
          <Alert className="lg:col-span-1 h-fit">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold mb-2">Payout Schedule</p>
              <p className="text-sm">Automatic payouts every 2 weeks on the 1st and 15th. Minimum balance: $10.</p>
            </AlertDescription>
          </Alert>
        </div>

        {/* Payout Method */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Payout Method</CardTitle>
            <CardDescription>Choose how you want to receive your earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <button
                onClick={() => setPayoutMethod("paypal")}
                className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
                  payoutMethod === "paypal" ? "border-accent bg-accent/5" : "border-border hover:bg-secondary"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-foreground">PayPal</p>
                  <p className="text-sm text-muted-foreground">Fast transfers worldwide</p>
                </div>
                {payoutMethod === "paypal" && <Check className="ml-auto h-5 w-5 text-accent" />}
              </button>

              <button
                onClick={() => setPayoutMethod("bank")}
                className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
                  payoutMethod === "bank" ? "border-accent bg-accent/5" : "border-border hover:bg-secondary"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <Building className="h-5 w-5 text-green-600 dark:text-green-500" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-foreground">Bank Transfer</p>
                  <p className="text-sm text-muted-foreground">Direct to your bank account</p>
                </div>
                {payoutMethod === "bank" && <Check className="ml-auto h-5 w-5 text-accent" />}
              </button>
            </div>

            {payoutMethod === "paypal" && (
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">PayPal Settings</h3>
                  {isVerified && (
                    <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-500">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">PayPal Email</label>
                    <Input type="email" placeholder="your@email.com" defaultValue="reviewer@example.com" />
                  </div>
                  <Button onClick={handleSaveSettings}>{isSaved ? "Saved!" : "Save PayPal Settings"}</Button>
                </div>
              </div>
            )}

            {payoutMethod === "bank" && (
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Bank Account Settings</h3>
                  {isVerified && (
                    <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-500">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Account Holder Name</label>
                    <Input placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Bank Name</label>
                    <Input placeholder="Your Bank" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Routing Number</label>
                      <Input placeholder="123456789" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Account Number</label>
                      <Input placeholder="••••••••1234" />
                    </div>
                  </div>
                  <Button onClick={handleSaveSettings}>{isSaved ? "Saved!" : "Save Bank Settings"}</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payout History */}
        <Card>
          <CardHeader>
            <CardTitle>Payout History</CardTitle>
            <CardDescription>View your past payouts and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {payouts.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{payout.method}</p>
                      <Badge variant={payout.status === "completed" ? "default" : "outline"}>
                        {payout.status === "completed" ? "Completed" : "Pending"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{payout.id}</p>
                    <p className="text-xs text-muted-foreground mt-1">{payout.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-accent">{payout.amount}</p>
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
              This is a demonstration of the billing interface. No real payouts will be processed. All transactions shown
              are mock data for testing purposes.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
