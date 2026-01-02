"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Shield, Bell, Database, ChevronRight } from "lucide-react"

const settingsLinks = [
  {
    title: "Profile",
    description: "Edit your administrator profile information",
    href: "/admin/profile",
    icon: User,
  },
  {
    title: "Security",
    description: "Manage security settings and access controls",
    href: "/admin/settings/security",
    icon: Shield,
    disabled: true,
  },
  {
    title: "Notifications",
    description: "Configure system notification preferences",
    href: "/admin/settings/notifications",
    icon: Bell,
    disabled: true,
  },
  {
    title: "System",
    description: "View system configuration and database status",
    href: "/admin/settings/system",
    icon: Database,
    disabled: true,
  },
]

export default function AdminSettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and system preferences</p>
      </div>

      <div className="grid gap-4 max-w-3xl">
        {settingsLinks.map((link) => (
          link.disabled ? (
            <Card key={link.href} className="opacity-60 cursor-not-allowed">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <link.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {link.title}
                        <span className="text-xs font-normal text-muted-foreground">(Coming Soon)</span>
                      </CardTitle>
                      <CardDescription className="text-sm">{link.description}</CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          ) : (
            <Link key={link.href} href={link.href}>
              <Card className="hover:bg-secondary/50 transition-colors cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                        <link.icon className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{link.title}</CardTitle>
                        <CardDescription className="text-sm">{link.description}</CardDescription>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          )
        ))}
      </div>
    </div>
  )
}
