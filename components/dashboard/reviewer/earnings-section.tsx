"use client"

import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react"

const weeklyEarnings = [
  { day: "Mon", amount: 2.4 },
  { day: "Tue", amount: 3.1 },
  { day: "Wed", amount: 1.8 },
  { day: "Thu", amount: 4.2 },
  { day: "Fri", amount: 2.9 },
  { day: "Sat", amount: 1.5 },
  { day: "Sun", amount: 0.6 },
]

const maxEarning = Math.max(...weeklyEarnings.map((d) => d.amount))

export function EarningsSection() {
  const totalWeek = weeklyEarnings.reduce((sum, d) => sum + d.amount, 0)

  const pendingQC = 2.8 // Tasks in QC_PENDING state
  const available = 42.3 // Approved tasks, ready for payout
  const paid = 156.8 // Already paid out

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
            <p className="text-sm text-muted-foreground">Pending QC</p>
          </div>
          <p className="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-500">${pendingQC.toFixed(2)}</p>
          <p className="mt-1 text-xs text-muted-foreground">24-48 hour hold</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
            <p className="text-sm text-muted-foreground">Available</p>
          </div>
          <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-500">${available.toFixed(2)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Ready for payout</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <p className="text-sm text-muted-foreground">This Week</p>
          </div>
          <p className="mt-1 text-2xl font-bold text-accent">${totalWeek.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Total Paid</p>
          </div>
          <p className="mt-1 text-2xl font-bold text-card-foreground">${paid.toFixed(2)}</p>
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
        <h2 className="text-lg font-semibold text-card-foreground mb-6">Weekly Earnings</h2>
        <div className="flex items-end justify-between gap-2 h-40">
          {weeklyEarnings.map((day) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full relative flex-1 flex items-end justify-center">
                <div
                  className="w-full max-w-8 rounded-t bg-accent transition-all"
                  style={{ height: `${(day.amount / maxEarning) * 100}%`, minHeight: "4px" }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{day.day}</span>
              <span className="text-xs font-medium text-foreground">${day.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">Earnings Breakdown</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Video Review Tasks</span>
            <span className="font-medium text-foreground">$38.40</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Bonus Tasks</span>
            <span className="font-medium text-foreground">$3.90</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">Total Available</span>
            <span className="font-bold text-accent">${available.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">Payment History</h2>
        <div className="space-y-3">
          {[
            { date: "Dec 15, 2025", amount: "$50.00", status: "Completed" },
            { date: "Dec 1, 2025", amount: "$45.50", status: "Completed" },
            { date: "Nov 15, 2025", amount: "$19.00", status: "Completed" },
          ].map((payment, index) => (
            <div key={index} className="flex items-center justify-between rounded-lg bg-secondary p-3">
              <div>
                <p className="font-medium text-foreground">{payment.amount}</p>
                <p className="text-sm text-muted-foreground">{payment.date}</p>
              </div>
              <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-500">
                {payment.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
