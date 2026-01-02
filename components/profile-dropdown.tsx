"use client"

import { useRouter } from "next/navigation"
import { User, Settings, CreditCard, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"

interface ProfileDropdownProps {
  /** Additional info to display below initials (e.g., "Pro Plan" or "$42.30 earned") */
  subtitle?: string
}

export function ProfileDropdown({ subtitle }: ProfileDropdownProps) {
  const router = useRouter()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/sign-in")
  }

  // Get the profile based on user role
  const getProfile = () => {
    if (user?.role === "CREATOR") return user.creatorProfile
    if (user?.role === "REVIEWER") return user.reviewerProfile
    if (user?.role === "ADMIN") return user.adminProfile
    return null
  }

  // Get user initials from firstName/lastName or fallback to email
  const getUserInitials = () => {
    const profile = getProfile()
    if (profile && "firstName" in profile && "lastName" in profile) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    }
    if (profile && "name" in profile && profile.name) {
      // Admin profile has 'name' field
      return profile.name.slice(0, 2).toUpperCase()
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return "??"
  }

  // Get display name
  const getDisplayName = () => {
    const profile = getProfile()
    if (profile && "displayName" in profile && profile.displayName) {
      return profile.displayName
    }
    if (profile && "firstName" in profile && "lastName" in profile) {
      return `${profile.firstName} ${profile.lastName}`
    }
    if (profile && "name" in profile && profile.name) {
      return profile.name
    }
    return user?.email?.split("@")[0] || "User"
  }

  // Get profile link based on role
  const getProfileLink = () => {
    switch (user?.role) {
      case "CREATOR":
        return "/creators/profile"
      case "REVIEWER":
        return "/reviewers/profile"
      case "ADMIN":
        return "/admin/profile"
      default:
        return "/profile"
    }
  }

  // Get settings link based on role
  const getSettingsLink = () => {
    switch (user?.role) {
      case "CREATOR":
        return "/creators/settings"
      case "REVIEWER":
        return "/reviewers/settings"
      case "ADMIN":
        return "/admin/settings"
      default:
        return "/settings"
    }
  }

  // Get billing link based on role
  const getBillingLink = () => {
    switch (user?.role) {
      case "CREATOR":
        return "/creators/billing"
      case "REVIEWER":
        return "/reviewers/billing"
      case "ADMIN":
        return "/admin/billing"
      default:
        return "/billing"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg p-1 hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2">
          {subtitle && (
            <span className="text-sm text-muted-foreground hidden sm:inline">{subtitle}</span>
          )}
          <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-sm font-medium text-accent">{getUserInitials()}</span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(getProfileLink())} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(getSettingsLink())} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(getBillingLink())} className="cursor-pointer">
          <CreditCard className="mr-2 h-4 w-4" />
          Billing
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
