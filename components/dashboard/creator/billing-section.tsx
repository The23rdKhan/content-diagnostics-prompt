"use client"

import { Button } from "@/components/ui/button"
import { CreditCard, Download, FileText } from "lucide-react"

const invoices = [
  { id: "INV-001", date: "Dec 15, 2025", amount: "$149.00", status: "Paid" },
  { id: "INV-002", date: "Nov 15, 2025", amount: "$149.00", status: "Paid" },
  { id: "INV-003", date: "Oct 15, 2025", amount: "$149.00", status: "Paid" },
]

export function BillingSection() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">Payment Method</h2>
        <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary p-4">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
              <p className="text-sm text-muted-foreground">Expires 12/2027</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Update
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">Billing Summary</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Current Plan</p>
            <p className="mt-1 text-xl font-bold text-foreground">$149/mo</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Add-ons This Month</p>
            <p className="mt-1 text-xl font-bold text-foreground">$0.00</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Next Invoice</p>
            <p className="mt-1 text-xl font-bold text-foreground">$149.00</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold text-card-foreground">Invoice History</h2>
        </div>
        <div className="divide-y divide-border">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">{invoice.id}</p>
                  <p className="text-sm text-muted-foreground">{invoice.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-foreground">{invoice.amount}</span>
                <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
                  {invoice.status}
                </span>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
