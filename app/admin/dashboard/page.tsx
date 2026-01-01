"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Users, FileText, Clock, AlertTriangle, TrendingUp, CheckCircle2, XCircle, DollarSign } from "lucide-react"
import { trackEvent } from "@/lib/analytics"
import { useState } from "react"

export default function AdminDashboard() {
  const [checkoutEnabled, setCheckoutEnabled] = useState(true)
  const [liveAddOnEnabled, setLiveAddOnEnabled] = useState(true)
  const [surgePayMultiplier, setSurgePayMultiplier] = useState(1.0)

  const handleCheckoutToggle = (enabled: boolean) => {
    setCheckoutEnabled(enabled)
    trackEvent("admin_checkout_toggled", { enabled })
  }

  const handleLiveAddOnToggle = (enabled: boolean) => {
    setLiveAddOnEnabled(enabled)
    trackEvent("admin_live_addon_toggled", { enabled })
  }

  const handleSurgePayIncrease = () => {
    const newMultiplier = surgePayMultiplier + 0.25
    setSurgePayMultiplier(newMultiplier)
    trackEvent("admin_surge_pay_applied", { multiplier: newMultiplier })
  }

  const handleSLAExtension = () => {
    trackEvent("admin_sla_extended", { from: "24h", to: "48h" })
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Operations Dashboard</h1>
        <p className="text-muted-foreground mt-1">Real-time marketplace health and controls</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Creators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">23</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-accent font-medium">+12</span> today, 157 in 7d
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">342</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-accent font-medium">+8%</span> vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Uploads Today</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">87</div>
            <p className="text-xs text-muted-foreground mt-1">723 segments to review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reports Delivered</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">134</div>
            <p className="text-xs text-muted-foreground mt-1">Avg 21.3h delivery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Delivery Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">21.3h</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-red-500 font-medium">+2.1h</span> vs target
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">SLA Misses</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">7</div>
            <p className="text-xs text-muted-foreground mt-1">5.2% of deliveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Reviewers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">286</div>
            <p className="text-xs text-muted-foreground mt-1">721 tasks completed today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Review Failure Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">8.4%</div>
            <p className="text-xs text-muted-foreground mt-1">61 rejected submissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Active Alerts
          </CardTitle>
          <CardDescription>Capacity and quality issues requiring attention</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                High
              </Badge>
              <div>
                <div className="font-medium text-foreground">Capacity low: Spanish (LATAM)</div>
                <div className="text-sm text-muted-foreground">Score: 42/100 - Only 3 reviewers available</div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                High
              </Badge>
              <div>
                <div className="font-medium text-foreground">High abandonment: PT-BR</div>
                <div className="text-sm text-muted-foreground">38% task abandonment rate in past 24h</div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Investigate
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100">
                Medium
              </Badge>
              <div>
                <div className="font-medium text-foreground">Payout holds accumulating</div>
                <div className="text-sm text-muted-foreground">$4,287 pending QC review across 18 reviewers</div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Review Queue
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Emergency controls and marketplace adjustments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="checkout-toggle" className="text-base font-medium">
                  Global Checkout
                </Label>
                <Switch id="checkout-toggle" checked={checkoutEnabled} onCheckedChange={handleCheckoutToggle} />
              </div>
              <p className="text-sm text-muted-foreground">
                {checkoutEnabled
                  ? "Creators can purchase new plans and submit videos"
                  : "New checkouts are currently blocked"}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="live-toggle" className="text-base font-medium">
                  Live Add-On Availability
                </Label>
                <Switch id="live-toggle" checked={liveAddOnEnabled} onCheckedChange={handleLiveAddOnToggle} />
              </div>
              <p className="text-sm text-muted-foreground">
                {liveAddOnEnabled ? "Live feedback sessions can be purchased" : "Live add-on is currently unavailable"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-base font-medium">SLA Window Extension</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={handleSLAExtension}>
                  Extend 24h → 48h
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Apply to all new uploads across all languages</p>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">
                Surge Pay Multiplier <span className="text-accent font-semibold">{surgePayMultiplier.toFixed(2)}x</span>
              </Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={handleSurgePayIncrease}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Increase by 0.25x
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Boost reviewer pay to increase task completion rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
