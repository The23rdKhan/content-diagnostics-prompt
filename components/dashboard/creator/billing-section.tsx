"use client"

import { logError } from "@/lib/error-tracking"

import { Button } from "@/components/ui/button"
import { CreditCard, Download, FileText, AlertCircle, RefreshCw, Loader2, Building } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useBillingSummary, usePaymentMethod, useInvoices, useDownloadInvoice, useUpdatePaymentMethod, type Invoice } from "@/lib/hooks/use-billing"

export function BillingSection() {
  const { summary, loading: summaryLoading, error: summaryError, refetch: refetchSummary } = useBillingSummary()
  const { paymentMethod, loading: pmLoading, error: pmError, refetch: refetchPm } = usePaymentMethod()
  const { invoices, loading: invoicesLoading, error: invoicesError, refetch: refetchInvoices } = useInvoices()
  const { downloadInvoice, loading: downloadingId } = useDownloadInvoice()
  const { initiateUpdate, loading: updating } = useUpdatePaymentMethod()

  const loading = summaryLoading || pmLoading || invoicesLoading
  const error = summaryError || pmError || invoicesError

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "PAID":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Paid</Badge>
      case "PENDING":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">Pending</Badge>
      case "OVERDUE":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">Overdue</Badge>
      case "REFUNDED":
        return <Badge variant="secondary">Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleUpdatePaymentMethod = async () => {
    try {
      const url = await initiateUpdate()
      window.location.href = url
    } catch (err) {
      logError("Failed to initiate payment update", err)
    }
  }

  const handleDownload = async (invoiceId: string) => {
    try {
      await downloadInvoice(invoiceId)
    } catch (err) {
      logError("Failed to download invoice", err)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="divide-y divide-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <div>
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
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
        <h2 className="mt-4 text-xl font-bold text-destructive">Failed to Load Billing</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Button className="mt-4" onClick={() => { refetchSummary(); refetchPm(); refetchInvoices(); }}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">Payment Method</h2>
        {paymentMethod ? (
          <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary p-4">
            <div className="flex items-center gap-3">
              {paymentMethod.type === "CARD" ? (
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Building className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-foreground">
                  {paymentMethod.brand ? `${paymentMethod.brand} ` : ""}
                  •••• •••• •••• {paymentMethod.lastFour}
                </p>
                {paymentMethod.expiryMonth && paymentMethod.expiryYear && (
                  <p className="text-sm text-muted-foreground">
                    Expires {paymentMethod.expiryMonth.toString().padStart(2, '0')}/{paymentMethod.expiryYear}
                  </p>
                )}
                {paymentMethod.bankName && (
                  <p className="text-sm text-muted-foreground">{paymentMethod.bankName}</p>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleUpdatePaymentMethod} disabled={updating}>
              {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
            </Button>
          </div>
        ) : (
          <div className="mt-4 rounded-lg bg-secondary p-4 text-center">
            <CreditCard className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No payment method on file</p>
            <Button className="mt-3" size="sm" onClick={handleUpdatePaymentMethod} disabled={updating}>
              {updating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Add Payment Method
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">Billing Summary</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Current Plan</p>
            <p className="mt-1 text-xl font-bold text-foreground">
              {summary ? formatCurrency(summary.currentPlanCost, summary.currency) : "$0"}/mo
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Add-ons This Month</p>
            <p className="mt-1 text-xl font-bold text-foreground">
              {summary ? formatCurrency(summary.addonsThisMonth, summary.currency) : "$0.00"}
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Next Invoice</p>
            <p className="mt-1 text-xl font-bold text-foreground">
              {summary ? formatCurrency(summary.nextInvoiceAmount, summary.currency) : "$0.00"}
            </p>
            {summary?.nextInvoiceDate && (
              <p className="text-xs text-muted-foreground mt-1">Due {formatDate(summary.nextInvoiceDate)}</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-card-foreground">Invoice History</h2>
          <Button variant="ghost" size="sm" onClick={() => refetchInvoices()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        {invoices.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No invoices yet</p>
            <p className="text-sm text-muted-foreground">Your invoice history will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(invoice.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-foreground">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </span>
                  {getStatusBadge(invoice.status)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(invoice.id)}
                    disabled={downloadingId === invoice.id}
                  >
                    {downloadingId === invoice.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
