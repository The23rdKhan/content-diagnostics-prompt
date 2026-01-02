"use client"

import { logError } from "@/lib/error-tracking"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAdminCreators, useAdminCreatorStats, useGrantCredit, type AdminCreatorDto } from "@/lib/hooks/use-admin"
import { trackEvent } from "@/lib/analytics"
import { Search, ExternalLink, DollarSign, AlertCircle, RefreshCw, Loader2 } from "lucide-react"

export default function CreatorsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const { creators, loading, error, refetch } = useAdminCreators(debouncedSearch || undefined)
  const { stats, loading: statsLoading } = useAdminCreatorStats()
  const { grantCredit, loading: granting, error: grantError } = useGrantCredit()

  const [creditDialogOpen, setCreditDialogOpen] = useState(false)
  const [selectedCreator, setSelectedCreator] = useState<AdminCreatorDto | null>(null)
  const [creditAmount, setCreditAmount] = useState(100)
  const [creditReason, setCreditReason] = useState("")

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const getPlanBadge = (tier: AdminCreatorDto["planTier"]) => {
    const badges = {
      basic: { label: "Basic", variant: "secondary" as const },
      professional: { label: "Professional", variant: "default" as const },
      enterprise: { label: "Enterprise", variant: "default" as const },
    }
    return badges[tier]
  }

  const handleOpenCreditDialog = (creator: AdminCreatorDto) => {
    setSelectedCreator(creator)
    setCreditAmount(100)
    setCreditReason("")
    setCreditDialogOpen(true)
  }

  const handleGrantCredit = async () => {
    if (!selectedCreator) return

    try {
      await grantCredit(selectedCreator.id, creditAmount, creditReason || undefined)
      trackEvent("admin_credit_granted", {
        creatorId: selectedCreator.id,
        amount: creditAmount,
      })
      setCreditDialogOpen(false)
      refetch()
    } catch (err) {
      logError("Failed to grant credit", err)
    }
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load creators. {error.message}</p>
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
        <h1 className="text-3xl font-bold text-foreground">Creator Management</h1>
        <p className="text-muted-foreground mt-1">Monitor creator activity and manage accounts</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Creators</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-foreground">{stats?.totalCreators ?? 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active This Month</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-foreground">{stats?.activeThisMonth ?? 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {stats?.totalUploads?.toLocaleString() ?? 0}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credits Issued</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                ${stats?.creditsIssued?.toLocaleString() ?? 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Creator List */}
      <Card>
        <CardHeader>
          <CardTitle>Creator Directory</CardTitle>
          <CardDescription>Search and manage creator accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Creator</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Uploads (Month)</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">SLA Issues</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Credits</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="py-3 px-4">
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-40" />
                      </td>
                      <td className="py-3 px-4"><Skeleton className="h-6 w-20" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-10" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-6 w-8" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-12" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-8 w-16" /></td>
                    </tr>
                  ))
                ) : creators.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      {searchQuery ? "No creators found matching your search" : "No creators found"}
                    </td>
                  </tr>
                ) : (
                  creators.map((creator) => {
                    const planBadge = getPlanBadge(creator.planTier)
                    return (
                      <tr key={creator.id} className="border-b border-border hover:bg-accent/10">
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground">{creator.name}</div>
                          <div className="text-sm text-muted-foreground">{creator.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={planBadge.variant}>{planBadge.label}</Badge>
                        </td>
                        <td className="py-3 px-4 text-foreground">{creator.uploadsThisMonth}</td>
                        <td className="py-3 px-4">
                          {creator.slaIssues > 0 ? (
                            <Badge variant="destructive">{creator.slaIssues}</Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {creator.creditsIssued > 0 ? (
                            <span className="text-foreground">${creator.creditsIssued}</span>
                          ) : (
                            <span className="text-muted-foreground">$0</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(creator.joinedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenCreditDialog(creator)}
                              title="Grant Credit"
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="View Details">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
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

      {/* Grant Credit Dialog */}
      <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Credit</DialogTitle>
            <DialogDescription>
              Issue a credit to {selectedCreator?.name} ({selectedCreator?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Credit Amount</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">$</span>
                <Input
                  id="amount"
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number.parseInt(e.target.value) || 0)}
                  min={1}
                  max={10000}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value)}
                placeholder="e.g., SLA miss compensation, goodwill credit..."
                rows={3}
              />
            </div>

            {grantError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3">
                <p className="text-sm text-destructive">{grantError.message}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditDialogOpen(false)} disabled={granting}>
              Cancel
            </Button>
            <Button onClick={handleGrantCredit} disabled={granting || creditAmount <= 0}>
              {granting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Granting...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Grant ${creditAmount}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
