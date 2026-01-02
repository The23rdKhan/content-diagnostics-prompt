"use client"

import { logError } from "@/lib/error-tracking"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { useAdminProfile, type UpdateAdminProfileRequest } from "@/lib/hooks/use-profile"
import { Loader2, Shield, AlertCircle, RefreshCw, Save, CheckCircle } from "lucide-react"

export default function AdminProfile() {
  const { user, refreshUser } = useAuth()
  const {
    profile,
    loading,
    error,
    refetch,
    updateProfile,
    updating,
    updateError,
  } = useAdminProfile()

  const [formData, setFormData] = useState<UpdateAdminProfileRequest>({
    name: "",
  })
  const [hasChanges, setHasChanges] = useState(false)
  const [saved, setSaved] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Sync profile data to form
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
      })
      setHasChanges(false)
    }
  }, [profile])

  const handleChange = (field: keyof UpdateAdminProfileRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
    setSaved(false)
    setValidationError(null)
  }

  const handleSave = async () => {
    setValidationError(null)

    if (!formData.name?.trim()) {
      setValidationError("Display name is required")
      return
    }
    if (formData.name.trim().length < 2) {
      setValidationError("Display name must be at least 2 characters")
      return
    }

    try {
      await updateProfile(formData)
      await refreshUser()
      setSaved(true)
      setHasChanges(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      logError("Failed to save profile", err)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="grid gap-6 max-w-2xl">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your administrator account settings</p>
        </div>
        <div className="max-w-2xl">
          <div className="rounded-xl border border-destructive bg-destructive/5 p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-xl font-bold text-destructive">Failed to Load Profile</h2>
            <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
            <Button className="mt-4" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
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
                  {(profile?.name || formData.name || "AD").slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground">{profile?.name || "Administrator"}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge className="mt-2" variant="outline">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              </div>
            </div>

            {/* Permissions */}
            {profile?.permissions && profile.permissions.length > 0 && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Permissions</p>
                <div className="flex flex-wrap gap-2">
                  {profile.permissions.map((permission) => (
                    <Badge key={permission} variant="secondary" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
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
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Your name"
                className="mt-1"
                disabled={updating}
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

            {(updateError || validationError) && (
              <Alert className="border-destructive/30 bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  {validationError || updateError?.message}
                </AlertDescription>
              </Alert>
            )}

            {saved && (
              <Alert className="border-green-500/30 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  Profile saved successfully!
                </AlertDescription>
              </Alert>
            )}

            <Button onClick={handleSave} disabled={updating || !hasChanges}>
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
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
