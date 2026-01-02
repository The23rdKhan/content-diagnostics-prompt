"use client"

import { logError } from "@/lib/error-tracking"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useAdminCapacity, useUpdateCapacity } from "@/lib/hooks/use-admin"
import type { LanguagePoolCapacity } from "@/lib/types/api"
import { trackEvent } from "@/lib/analytics"
import { Settings, AlertTriangle, CheckCircle2, RefreshCw, AlertCircle, Loader2 } from "lucide-react"

export default function CapacityPage() {
  const { capacity, loading, error, refetch } = useAdminCapacity()
  const { updateCapacity, loading: saving, error: saveError } = useUpdateCapacity()
  const [editingPool, setEditingPool] = useState<LanguagePoolCapacity | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const pools = capacity?.languagePools ?? []

  const handleEditPool = (pool: LanguagePoolCapacity) => {
    setEditingPool({ ...pool })
    setSheetOpen(true)
  }

  const handleSavePool = async () => {
    if (!editingPool) return

    try {
      await updateCapacity(editingPool.id, {
        currentSLA: editingPool.currentSLA,
        maxReviewersPerVideo: editingPool.maxReviewersPerVideo,
        checkoutEnabled: editingPool.checkoutEnabled,
        liveAddOnEnabled: editingPool.liveAddOnEnabled,
      })
      trackEvent("admin_capacity_changed", {
        poolId: editingPool.id,
        sla: editingPool.currentSLA,
        maxReviewers: editingPool.maxReviewersPerVideo,
        checkoutEnabled: editingPool.checkoutEnabled,
      })
      setSheetOpen(false)
      refetch()
    } catch (err) {
      logError("Failed to save capacity", err)
    }
  }

  const getCapacityBadge = (score: number) => {
    if (score >= 70)
      return { label: "Healthy", variant: "default" as const, color: "text-green-600 dark:text-green-400" }
    if (score >= 50)
      return { label: "Fair", variant: "secondary" as const, color: "text-amber-600 dark:text-amber-400" }
    return { label: "Low", variant: "destructive" as const, color: "text-red-600 dark:text-red-400" }
  }

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load capacity data. Please try again.</p>
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
        <h1 className="text-3xl font-bold text-foreground">Capacity Management</h1>
        <p className="text-muted-foreground mt-1">Monitor and adjust language pool capacity and availability</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Language Pools</CardTitle>
          <CardDescription>Current capacity scores and operational settings by language</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Language</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Capacity</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">SLA</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Max Reviewers</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Active Today</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Checkout</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Live Add-On</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="py-3 px-4">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-16 mt-1" />
                      </td>
                      <td className="py-3 px-4"><Skeleton className="h-8 w-20" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-12" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-8" /></td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-16 mt-1" />
                      </td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-5" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-5" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-8 w-8" /></td>
                    </tr>
                  ))
                ) : pools.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No language pools configured
                    </td>
                  </tr>
                ) : (
                  pools.map((pool) => {
                    const capacityBadge = getCapacityBadge(pool.capacityScore)
                    return (
                      <tr key={pool.id} className="border-b border-border hover:bg-accent/10">
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground">{pool.name}</div>
                          <div className="text-sm text-muted-foreground">{pool.code}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-2xl font-bold ${capacityBadge.color}`}>{pool.capacityScore}</span>
                            <Badge variant={capacityBadge.variant}>{capacityBadge.label}</Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-foreground">{pool.currentSLA}</td>
                        <td className="py-3 px-4 text-foreground">{pool.maxReviewersPerVideo}</td>
                        <td className="py-3 px-4">
                          <div className="text-foreground">{pool.activeReviewers} reviewers</div>
                          <div className="text-sm text-muted-foreground">{pool.pendingTasks} pending</div>
                        </td>
                        <td className="py-3 px-4">
                          {pool.checkoutEnabled ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {pool.liveAddOnEnabled ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm" onClick={() => handleEditPool(pool)}>
                            <Settings className="h-4 w-4" />
                          </Button>
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

      {/* Edit Capacity Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Capacity Settings</SheetTitle>
            <SheetDescription>{editingPool?.name} capacity and availability controls</SheetDescription>
          </SheetHeader>

          {editingPool && (
            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="sla">Current SLA</Label>
                <Input
                  id="sla"
                  value={editingPool.currentSLA}
                  onChange={(e) => setEditingPool({ ...editingPool, currentSLA: e.target.value })}
                  placeholder="24h"
                />
                <p className="text-sm text-muted-foreground">Guaranteed delivery window (e.g., 24h, 36h, 48h)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxReviewers">Max Reviewers per Video</Label>
                <Input
                  id="maxReviewers"
                  type="number"
                  value={editingPool.maxReviewersPerVideo}
                  onChange={(e) =>
                    setEditingPool({ ...editingPool, maxReviewersPerVideo: Number.parseInt(e.target.value) || 3 })
                  }
                  min={1}
                  max={10}
                />
                <p className="text-sm text-muted-foreground">Maximum number of reviewers that can be assigned</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="checkout">Checkout Enabled</Label>
                  <Switch
                    id="checkout"
                    checked={editingPool.checkoutEnabled}
                    onCheckedChange={(checked) => setEditingPool({ ...editingPool, checkoutEnabled: checked })}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {editingPool.checkoutEnabled
                    ? "Creators can purchase and submit to this language pool"
                    : "New checkouts blocked - existing customers only"}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="live">Live Add-On Enabled</Label>
                  <Switch
                    id="live"
                    checked={editingPool.liveAddOnEnabled}
                    onCheckedChange={(checked) => setEditingPool({ ...editingPool, liveAddOnEnabled: checked })}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {editingPool.liveAddOnEnabled
                    ? "Live feedback sessions available for purchase"
                    : "Live add-on temporarily unavailable"}
                </p>
              </div>

              {!editingPool.checkoutEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="blockReason">Block Reason (shown to creators)</Label>
                  <Textarea
                    id="blockReason"
                    placeholder="Temporarily unavailable due to reviewer capacity constraints. Expected availability: Jan 15."
                    rows={3}
                  />
                </div>
              )}

              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="text-sm font-medium text-foreground mb-2">Preview: Creator-Facing Message</div>
                <div className="text-sm text-muted-foreground">
                  {editingPool.checkoutEnabled ? (
                    <div className="space-y-1">
                      <div>
                        <span className="font-medium text-accent">{editingPool.name}</span> is available
                      </div>
                      <div>SLA: {editingPool.currentSLA}</div>
                      <div>Up to {editingPool.maxReviewersPerVideo} reviewers per video</div>
                      {editingPool.liveAddOnEnabled && <div>Live feedback sessions available</div>}
                    </div>
                  ) : (
                    <div className="text-amber-600 dark:text-amber-400">
                      {editingPool.name} is currently unavailable. We'll notify you when capacity returns.
                    </div>
                  )}
                </div>
              </div>

              {saveError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3">
                  <p className="text-sm text-destructive">{saveError.message}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSavePool} className="flex-1" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setSheetOpen(false)} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
