"use client"

import { logError } from "@/lib/error-tracking"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdminPayouts, useAdminPayoutStats, useReleasePayout, type AdminPayoutDto } from "@/lib/hooks/use-admin"
import { trackEvent } from "@/lib/analytics"
import { DollarSign, Clock, CheckCircle2, AlertCircle, RefreshCw, Loader2 } from "lucide-react"

export default function PayoutsPage() {
  const { payouts, loading, error, refetch } = useAdminPayouts()
  const { stats, loading: statsLoading } = useAdminPayoutStats()
  const { releasePayout, loading: releasing, error: releaseError } = useReleasePayout()
  const [payoutThreshold, setPayoutThreshold] = useState(50)
  const [holdWindow, setHoldWindow] = useState(7)
  const [releasingId, setReleasingId] = useState<number | null>(null)

  const handleReleasePayout = async (payoutId: number) => {
    setReleasingId(payoutId)
    try {
      await releasePayout(payoutId)
      trackEvent("admin_payout_released", { payoutId })
      refetch()
    } catch (err) {
      logError("Failed to release payout", err)
    } finally {
      setReleasingId(null)
    }
  }

  const getStatusBadge = (status: AdminPayoutDto["holdStatus"]) => {
    const badges = {
      pending: { label: "Pending", variant: "secondary" as const },
      qc: { label: "QC Review", variant: "default" as const },
      ready: { label: "Ready", variant: "default" as const },
      released: { label: "Released", variant: "outline" as const },
    }
    return badges[status]
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load payouts. {error.message}</p>
            </div>
            <Button variant="outline" className="mt-4" onClick={refetch}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  ${stats?.totalPending?.toFixed(2) ?? "0.00"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {stats?.pendingCount ?? 0} reviewers
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Released This Week</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  ${stats?.releasedThisWeek?.toLocaleString() ?? "0"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.releasedCount ?? 0} payouts processed
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dispute Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{stats?.disputeCount ?? 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Requires admin review</p>
              </>
            )}
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
            <Button variant="outline" size="sm">Change to Weekly</Button>
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
          {releaseError && (
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/30 p-3">
              <p className="text-sm text-destructive">{releaseError.message}</p>
            </div>
          )}

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
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="py-3 px-4">
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-20" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-16" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-6 w-20" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-8 w-20" /></td>
                    </tr>
                  ))
                ) : payouts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No payouts found
                    </td>
                  </tr>
                ) : (
                  payouts.map((payout) => {
                    const statusBadge = getStatusBadge(payout.holdStatus)
                    const isReleasing = releasingId === payout.id
                    return (
                      <tr key={payout.id} className="border-b border-border hover:bg-accent/10">
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground">{payout.reviewerName}</div>
                          <div className="text-sm text-muted-foreground">rev-{payout.reviewerId}</div>
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
                            <Button
                              size="sm"
                              onClick={() => handleReleasePayout(payout.id)}
                              disabled={releasing}
                            >
                              {isReleasing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                              )}
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
                  })
                )}
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
              <Button variant="outline" size="sm">Review</Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <div className="font-medium text-foreground">Jean Dupont - Payment Method Issue</div>
                <div className="text-sm text-muted-foreground">
                  Bank account verification failed, needs manual review
                </div>
              </div>
              <Button variant="outline" size="sm">Review</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
