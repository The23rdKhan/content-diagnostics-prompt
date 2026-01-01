"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { payouts as initialPayouts } from "@/lib/admin-data"
import type { Payout } from "@/lib/admin-data"
import { trackEvent } from "@/lib/analytics"
import { DollarSign, Clock, CheckCircle2 } from "lucide-react"

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState(initialPayouts)
  const [payoutThreshold, setPayoutThreshold] = useState(50)
  const [holdWindow, setHoldWindow] = useState(7)

  const handleReleasePayout = (payoutId: string) => {
    setPayouts(payouts.map((p) => (p.id === payoutId ? { ...p, holdStatus: "released" as const } : p)))
    trackEvent("admin_payout_released", { payoutId })
  }

  const getStatusBadge = (status: Payout["holdStatus"]) => {
    const badges = {
      pending: { label: "Pending", variant: "secondary" as const },
      qc: { label: "QC Review", variant: "default" as const },
      ready: { label: "Ready", variant: "default" as const },
      released: { label: "Released", variant: "outline" as const },
    }
    return badges[status]
  }

  const totalPending = payouts.filter((p) => p.holdStatus !== "released").reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payout Management</h1>
        <p className="text-muted-foreground mt-1">Manage reviewer payouts and payout policies</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${totalPending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {payouts.filter((p) => p.holdStatus !== "released").length} reviewers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Released This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">$12,487</div>
            <p className="text-xs text-muted-foreground mt-1">87 payouts processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dispute Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">2</div>
            <p className="text-xs text-muted-foreground mt-1">Requires admin review</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Policy */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Policy Settings</CardTitle>
          <CardDescription>Configure payout thresholds and timing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="threshold">Payout Threshold</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">$</span>
                <Input
                  id="threshold"
                  type="number"
                  value={payoutThreshold}
                  onChange={(e) => setPayoutThreshold(Number.parseInt(e.target.value) || 50)}
                  min={10}
                  max={500}
                />
              </div>
              <p className="text-sm text-muted-foreground">Minimum balance required to request payout</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="holdWindow">Hold Window (QC)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="holdWindow"
                  type="number"
                  value={holdWindow}
                  onChange={(e) => setHoldWindow(Number.parseInt(e.target.value) || 7)}
                  min={1}
                  max={30}
                />
                <span className="text-muted-foreground">days</span>
              </div>
              <p className="text-sm text-muted-foreground">Quality control review period before release</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div>
              <div className="font-medium text-foreground">Payout Schedule</div>
              <div className="text-sm text-muted-foreground">Manual release (on-demand)</div>
            </div>
            <Button variant="outline" size="sm">
              Change to Weekly
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payout Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Queue</CardTitle>
          <CardDescription>Review and release pending payouts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reviewer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tasks</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Created</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => {
                  const statusBadge = getStatusBadge(payout.holdStatus)
                  return (
                    <tr key={payout.id} className="border-b border-border hover:bg-accent/10">
                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground">{payout.reviewerName}</div>
                        <div className="text-sm text-muted-foreground">{payout.reviewerId}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-foreground font-semibold">
                          <DollarSign className="h-4 w-4" />
                          {payout.amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground">{payout.tasksIncluded} tasks</td>
                      <td className="py-3 px-4">
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(payout.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {payout.holdStatus === "ready" ? (
                          <Button size="sm" onClick={() => handleReleasePayout(payout.id)}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Release
                          </Button>
                        ) : payout.holdStatus === "released" ? (
                          <span className="text-sm text-muted-foreground">Released</span>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            <Clock className="mr-2 h-4 w-4" />
                            In Review
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dispute Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Disputes</CardTitle>
          <CardDescription>Active payout dispute tickets requiring resolution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <div className="font-medium text-foreground">Carlos Rodriguez - Missing Tasks</div>
                <div className="text-sm text-muted-foreground">
                  Reviewer claims 3 tasks not included in payout calculation
                </div>
              </div>
              <Button variant="outline" size="sm">
                Review
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <div className="font-medium text-foreground">Jean Dupont - Payment Method Issue</div>
                <div className="text-sm text-muted-foreground">
                  Bank account verification failed, needs manual review
                </div>
              </div>
              <Button variant="outline" size="sm">
                Review
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
