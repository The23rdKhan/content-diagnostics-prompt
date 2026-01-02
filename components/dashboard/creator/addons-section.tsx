"use client"

import { Button } from "@/components/ui/button"
import { Plus, Users, Zap, FileText, Video, AlertCircle, RefreshCw, Package } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useAvailableAddons, useActiveAddons, type Addon, type ActiveAddon } from "@/lib/hooks/use-addons"

// Icon mapping for add-on categories
const categoryIcons: Record<string, React.ElementType> = {
  REVIEWERS: Users,
  DELIVERY: Zap,
  ANALYSIS: FileText,
  LIVE: Video,
}

// Default add-ons if API doesn't return any
const defaultAddons: Addon[] = [
  {
    id: "reviewers",
    name: "Additional Reviewers",
    description: "Add more reviewers to any submission",
    price: 1.5,
    priceDisplay: "$1.50 per reviewer",
    category: "REVIEWERS",
  },
  {
    id: "delivery",
    name: "Faster Delivery",
    description: "Expedite your feedback turnaround",
    price: 25,
    priceDisplay: "Starting at $25",
    category: "DELIVERY",
  },
  {
    id: "summary",
    name: "Full-Watch Summary",
    description: "Extended reviewer summaries for longer content",
    price: 15,
    priceDisplay: "$15 per video",
    category: "ANALYSIS",
  },
  {
    id: "live",
    name: "Live Feedback Session",
    description: "Real-time feedback from reviewers (availability-based)",
    price: 99,
    priceDisplay: "Starting at $99",
    category: "LIVE",
  },
]

export function AddonsSection() {
  const { addons, loading: addonsLoading, error: addonsError, refetch: refetchAddons } = useAvailableAddons()
  const { activeAddons, loading: activeLoading, error: activeError, refetch: refetchActive } = useActiveAddons()

  const loading = addonsLoading || activeLoading
  const error = addonsError || activeError

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const getStatusBadge = (status: ActiveAddon["status"]) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Active</Badge>
      case "COMPLETED":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">Completed</Badge>
      case "REFUNDED":
        return <Badge variant="secondary">Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-destructive bg-destructive/5 p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-bold text-destructive">Failed to Load Add-ons</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Button className="mt-4" onClick={() => { refetchAddons(); refetchActive(); }}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  // Use API data or fallback to defaults
  const displayAddons = addons.length > 0 ? addons : defaultAddons

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">Available Add-ons</h2>
        <p className="mt-1 text-sm text-muted-foreground">Enhance your reviews with additional features</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {displayAddons.map((addon) => {
          const IconComponent = categoryIcons[addon.category] || Package

          return (
            <div key={addon.id} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <IconComponent className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground">{addon.name}</h3>
                    <p className="text-sm text-muted-foreground">{addon.description}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium text-accent">{addon.priceDisplay}</span>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground">Active Add-ons</h2>
          {activeAddons.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => refetchActive()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>

        {activeAddons.length === 0 ? (
          <div className="rounded-lg bg-secondary p-4 text-center">
            <Package className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No active add-ons</p>
            <p className="text-sm text-muted-foreground">
              Add-ons will appear here when applied to a video submission
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeAddons.map((active) => (
              <div key={active.id} className="p-4 border border-border rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">{active.addonName}</p>
                    {active.jobTitle && (
                      <p className="text-sm text-muted-foreground">Applied to: {active.jobTitle}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(active.appliedDate)} • ${active.price.toFixed(2)}
                    </p>
                  </div>
                  {getStatusBadge(active.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
