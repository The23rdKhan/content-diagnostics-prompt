"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Gauge, ListTodo, Users, DollarSign, UserCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Capacity", href: "/admin/capacity", icon: Gauge },
  { name: "Tasks", href: "/admin/tasks", icon: ListTodo },
  { name: "Reviewers", href: "/admin/reviewers", icon: Users },
  { name: "Payouts", href: "/admin/payouts", icon: DollarSign },
  { name: "Creators", href: "/admin/creators", icon: UserCircle },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-background">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
          <span className="text-sm font-bold text-accent-foreground">CD</span>
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">Admin Ops</div>
          <div className="text-xs text-muted-foreground">Operations Console</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
              <span className="text-xs font-semibold text-accent-foreground">
                {user?.adminProfile?.name?.charAt(0) || "A"}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">{user?.adminProfile?.name || "Admin"}</div>
              <div className="text-xs text-muted-foreground">Administrator</div>
            </div>
          </div>
          <ThemeToggle />
        </div>
        <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
