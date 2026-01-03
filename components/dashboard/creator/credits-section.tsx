"use client"

import { useState } from "react"
import { logError } from "@/lib/error-tracking"

import { Button } from "@/components/ui/button"
import { Coins, TrendingUp, TrendingDown, Video, AlertCircle, RefreshCw, Loader2, Sparkles, Check, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useCreditBalance, useCreditBundles, useCreditTransactions, usePurchaseCredits, type CreditBundle, type CreditTransaction } from "@/lib/hooks/use-credits"

export function CreditsSection() {
  const { balance, creditsPerVideo, videosAvailable, usedThisMonth, loading: balanceLoading, error: balanceError, refetch: refetchBalance } = useCreditBalance()
  const { bundles, loading: bundlesLoading, error: bundlesError } = useCreditBundles()
  const { transactions, loading: txLoading, error: txError, refetch: refetchTx } = useCreditTransactions(0, 5)
  const { purchaseCredits, loading: purchasing } = usePurchaseCredits()

  const [selectedBundle, setSelectedBundle] = useState<string | null>(null)
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)

  const loading = balanceLoading || bundlesLoading || txLoading
  const error = balanceError || bundlesError || txError

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getTransactionIcon = (type: CreditTransaction["type"]) => {
    switch (type) {
      case "PURCHASE":
      case "SUBSCRIPTION":
      case "ADMIN_ISSUE":
      case "PROMO":
      case "REFUND":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "USAGE":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Coins className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTransactionBadge = (type: CreditTransaction["type"]) => {
    switch (type) {
      case "PURCHASE":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Purchase</Badge>
      case "USAGE":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">Used</Badge>
      case "SUBSCRIPTION":
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30">Subscription</Badge>
      case "ADMIN_ISSUE":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">Admin</Badge>
      case "REFUND":
        return <Badge variant="outline" className="bg-cyan-500/10 text-cyan-600 border-cyan-500/30">Refund</Badge>
      case "PROMO":
        return <Badge variant="outline" className="bg-pink-500/10 text-pink-600 border-pink-500/30">Promo</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const handlePurchase = async (bundleId: string) => {
    setPurchaseError(null)
    try {
      await purchaseCredits(bundleId)
      setPurchaseDialogOpen(false)
    } catch (err) {
      logError("Failed to purchase credits", err)
      setPurchaseError(err instanceof Error ? err.message : "Failed to purchase credits. Please try again.")
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-destructive bg-destructive/5 p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-bold text-destructive">Failed to Load Credits</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Button className="mt-4" onClick={() => { refetchBalance(); refetchTx(); }}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Credit Balance Card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground">Credit Balance</h2>
          <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Coins className="mr-2 h-4 w-4" />
                Buy Credits
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Purchase Credits</DialogTitle>
                <DialogDescription>
                  Choose a credit bundle. Credits never expire and can be used for any video submission.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-2 mt-4">
                {bundles.map((bundle) => (
                  <div
                    key={bundle.id}
                    className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all hover:border-accent/50 ${
                      selectedBundle === bundle.id
                        ? "border-accent bg-accent/5"
                        : "border-border"
                    }`}
                    onClick={() => setSelectedBundle(bundle.id)}
                  >
                    {bundle.popular && (
                      <Badge className="absolute -top-2 -right-2 bg-accent">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                    {selectedBundle === bundle.id && (
                      <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-accent flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <h3 className="font-semibold text-foreground">{bundle.name}</h3>
                    <p className="text-2xl font-bold text-accent mt-1">{bundle.credits} credits</p>
                    <p className="text-sm text-muted-foreground">{bundle.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-lg font-semibold">{formatCurrency(bundle.price)}</span>
                      {bundle.savingsPercent > 0 && (
                        <Badge variant="secondary">Save {bundle.savingsPercent}%</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(bundle.pricePerCredit)}/credit
                    </p>
                  </div>
                ))}
              </div>
              {purchaseError && (
                <Alert className="mt-4 border-destructive bg-destructive/5">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">
                    {purchaseError}
                  </AlertDescription>
                </Alert>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setPurchaseDialogOpen(false); setPurchaseError(null); }}>
                  Cancel
                </Button>
                <Button
                  onClick={() => selectedBundle && handlePurchase(selectedBundle)}
                  disabled={!selectedBundle || purchasing}
                >
                  {purchasing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Coins className="mr-2 h-4 w-4" />
                      Purchase Credits
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-accent/10 border border-accent/20 p-4">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-accent" />
              <p className="text-sm text-muted-foreground">Current Balance</p>
            </div>
            <p className="mt-2 text-3xl font-bold text-foreground">{balance}</p>
            <p className="text-sm text-muted-foreground">credits</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Videos Available</p>
            </div>
            <p className="mt-2 text-3xl font-bold text-foreground">{videosAvailable}</p>
            <p className="text-sm text-muted-foreground">{creditsPerVideo} credits per video</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Used This Month</p>
            </div>
            <p className="mt-2 text-3xl font-bold text-foreground">{usedThisMonth}</p>
            <p className="text-sm text-muted-foreground">credits</p>
          </div>
        </div>
      </div>

      {/* Quick Buy Bundles */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">Credit Bundles</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className="relative rounded-lg border border-border p-4 hover:border-accent/50 transition-colors"
            >
              {bundle.popular && (
                <Badge className="absolute -top-2 -right-2 bg-accent text-xs">Popular</Badge>
              )}
              <p className="font-semibold text-foreground">{bundle.name}</p>
              <p className="text-xl font-bold text-accent mt-1">{bundle.credits} credits</p>
              <p className="text-sm text-muted-foreground">{bundle.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-semibold">{formatCurrency(bundle.price)}</span>
                {bundle.savingsPercent > 0 && (
                  <span className="text-xs text-green-600">-{bundle.savingsPercent}%</span>
                )}
              </div>
              <Button
                className="w-full mt-3"
                size="sm"
                onClick={() => handlePurchase(bundle.id)}
                disabled={purchasing}
              >
                {purchasing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Buy Now"
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-card-foreground">Recent Activity</h2>
          <Button variant="ghost" size="sm" onClick={() => refetchTx()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        {transactions.length === 0 ? (
          <div className="p-6 text-center">
            <Coins className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No credit activity yet</p>
            <p className="text-sm text-muted-foreground">Your credit transactions will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {getTransactionIcon(tx.type)}
                  <div>
                    <p className="font-medium text-foreground">{tx.description}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(tx.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-semibold ${tx.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                    {tx.amount > 0 ? "+" : ""}{tx.amount}
                  </span>
                  {getTransactionBadge(tx.type)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
