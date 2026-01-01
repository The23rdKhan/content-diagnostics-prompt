"use client"

import { DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useReviewerEarnings } from "@/lib/hooks/use-reviewer"

export function EarningsSection() {
  const { earnings, loading, error, refetch } = useReviewerEarnings()

  // Derive values from API response
  const pendingQC = earnings?.pendingEarnings ?? 0
  const available = earnings?.availableForPayout ?? 0
  const totalMonth = earnings?.earningsThisMonth ?? 0
  const totalPaid = earnings?.totalEarnings ?? 0
  const recentEarnings = earnings?.recentEarnings ?? []

  // Calculate max earning for chart scaling
  const maxEarning = Math.max(...recentEarnings.map((d) => d.amount), 1)

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-destructive bg-destructive/5 p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-bold text-destructive">Failed to Load Earnings</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Unable to fetch earnings data. Please try again.
        </p>
        <Button className="mt-4" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
            <p className="text-sm text-muted-foreground">Pending QC</p>
          </div>
          {loading ? (
            <Skeleton className="mt-1 h-8 w-20" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-500">${pendingQC.toFixed(2)}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">24-48 hour hold</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
            <p className="text-sm text-muted-foreground">Available</p>
          </div>
          {loading ? (
            <Skeleton className="mt-1 h-8 w-20" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-500">${available.toFixed(2)}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">Ready for payout</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <p className="text-sm text-muted-foreground">This Month</p>
          </div>
          {loading ? (
            <Skeleton className="mt-1 h-8 w-20" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-accent">${totalMonth.toFixed(2)}</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Total Earnings</p>
          </div>
          {loading ? (
            <Skeleton className="mt-1 h-8 w-20" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-card-foreground">${totalPaid.toFixed(2)}</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">Payout Information</h2>
        <div className="space-y-4">
          <div className="rounded-lg bg-secondary p-4">
            <h3 className="font-medium text-foreground mb-2">Quality Hold Window</h3>
            <p className="text-sm text-muted-foreground">
              Earnings are held for 24-48 hours after task submission for quality checks. Once approved, funds move to
              your available balance.
            </p>
          </div>
          <div className="rounded-lg bg-secondary p-4">
            <h3 className="font-medium text-foreground mb-2">Minimum Payout Threshold</h3>
            <p className="text-sm text-muted-foreground">
              You need a minimum of <strong>$10.00</strong> in available balance to request a payout.
              {available >= 10 ? (
                <span className="block mt-2 text-green-600 dark:text-green-500 font-medium">
                  ✓ You meet the minimum threshold
                </span>
              ) : (
                <span className="block mt-2 text-yellow-600 dark:text-yellow-500 font-medium">
                  ${(10 - available).toFixed(2)} more needed
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-6">Recent Earnings</h2>
        {loading ? (
          <div className="flex items-end justify-between gap-2 h-40">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <Skeleton className="w-full max-w-8 h-20" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        ) : recentEarnings.length > 0 ? (
          <div className="flex items-end justify-between gap-2 h-40">
            {recentEarnings.slice(0, 7).map((day) => {
              const shortDate = new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative flex-1 flex items-end justify-center">
                    <div
                      className="w-full max-w-8 rounded-t bg-accent transition-all"
                      style={{ height: `${(day.amount / maxEarning) * 100}%`, minHeight: "4px" }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{shortDate}</span>
                  <span className="text-xs font-medium text-foreground">${day.amount.toFixed(2)}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-muted-foreground">
            No recent earnings data
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">Balance Summary</h2>
        <div className="space-y-4">
          {loading ? (
            <>
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-16" />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pending QC Review</span>
                <span className="font-medium text-yellow-600 dark:text-yellow-500">${pendingQC.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">This Month Earnings</span>
                <span className="font-medium text-foreground">${totalMonth.toFixed(2)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Available for Payout</span>
                <span className="font-bold text-accent">${available.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">Payment History</h2>
        <div className="space-y-3">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                <div>
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-24 mt-1" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">Payment history will appear here once you request a payout.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
