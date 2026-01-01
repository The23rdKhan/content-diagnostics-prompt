"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Billing & Invoices</h1>
        <p className="text-lg text-muted-foreground mb-12">Manage your payment method and view invoices.</p>

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
