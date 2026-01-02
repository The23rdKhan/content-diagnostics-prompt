"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Shield } from "lucide-react"

export default function AdminProfile() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.adminProfile?.name || "")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)

    // Simulate save - in production this would call an API
    await new Promise(resolve => setTimeout(resolve, 500))

    setIsSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your administrator account settings</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Account Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Account Information
            </CardTitle>
            <CardDescription>Your administrator account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
              <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-accent">
                  {user?.adminProfile?.name?.slice(0, 2).toUpperCase() || "AD"}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground">{user?.adminProfile?.name || "Administrator"}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge className="mt-2" variant="outline">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your display name</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="mt-1 bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>

            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : saveSuccess ? (
                "Saved!"
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Security Info */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Account security information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-accent/5 border border-accent/20 p-4">
              <p className="text-sm text-foreground">
                As an administrator, you have elevated privileges. Please ensure you:
              </p>
              <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Use a strong, unique password</li>
                <li>Never share your login credentials</li>
                <li>Log out when using shared devices</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
