"use client"

import { Button } from "@/components/ui/button"
import { Plus, Users, Zap, FileText, Video } from "lucide-react"

const addons = [
  {
    id: "reviewers",
    name: "Additional Reviewers",
    description: "Add more reviewers to any submission",
    price: "$1.50 per reviewer",
    icon: Users,
  },
  {
    id: "delivery",
    name: "Faster Delivery",
    description: "Expedite your feedback turnaround",
    price: "Starting at $25",
    icon: Zap,
  },
  {
    id: "summary",
    name: "Full-Watch Summary",
    description: "Extended reviewer summaries for longer content",
    price: "$15 per video",
    icon: FileText,
  },
  {
    id: "live",
    name: "Live Feedback Session",
    description: "Real-time feedback from reviewers (availability-based)",
    price: "Starting at $99",
    icon: Video,
  },
]

export function AddonsSection() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">Available Add-ons</h2>
        <p className="mt-1 text-sm text-muted-foreground">Enhance your reviews with additional features</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {addons.map((addon) => (
          <div key={addon.id} className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <addon.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground">{addon.name}</h3>
                  <p className="text-sm text-muted-foreground">{addon.description}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-medium text-accent">{addon.price}</span>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">Active Add-ons</h2>
        <div className="rounded-lg bg-secondary p-4 text-center">
          <p className="text-muted-foreground">No active add-ons</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add-ons will appear here when applied to a video submission
          </p>
        </div>
      </div>
    </div>
  )
}
