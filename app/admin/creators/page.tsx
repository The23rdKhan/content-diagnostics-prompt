"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { creators as initialCreators } from "@/lib/admin-data"
import type { Creator } from "@/lib/admin-data"
import { trackEvent } from "@/lib/analytics"
import { Search, ExternalLink, DollarSign } from "lucide-react"

export default function CreatorsPage() {
  const [creators, setCreators] = useState(initialCreators)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCreators = creators.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getPlanBadge = (tier: Creator["planTier"]) => {
    const badges = {
      basic: { label: "Basic", variant: "secondary" as const },
      professional: { label: "Professional", variant: "default" as const },
      enterprise: { label: "Enterprise", variant: "default" as const },
    }
    return badges[tier]
  }

  const handleGrantCredit = (creatorId: string) => {
    trackEvent("admin_credit_granted", { creatorId, amount: 100 })
    alert(`Credit granted to creator ${creatorId}`)
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
            <div className="text-2xl font-bold text-foreground">342</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">217</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">1,847</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credits Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">$2,340</div>
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
                {filteredCreators.map((creator) => {
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
                          <Button variant="ghost" size="sm" onClick={() => handleGrantCredit(creator.id)}>
                            <DollarSign className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
