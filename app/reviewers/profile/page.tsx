"use client"

import { logError } from "@/lib/error-tracking"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { trackEvent } from "@/lib/analytics"
import Link from "next/link"
import { User, Save, AlertCircle, RefreshCw, CheckCircle, XCircle } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { ImageUpload } from "@/components/image-upload"
import { useReviewerProfileWithUpdate, type UpdateReviewerProfileRequest } from "@/lib/hooks/use-profile"
import { useAuth } from "@/lib/auth-context"

const PROFICIENCY_LEVELS = [
  { value: "NATIVE", label: "Native Speaker" },
  { value: "FLUENT", label: "Fluent" },
  { value: "ADVANCED", label: "Advanced" },
  { value: "INTERMEDIATE", label: "Intermediate" },
]

export default function ReviewerProfilePage() {
  const { refreshUser } = useAuth()
  const {
    profile,
    loading,
    error,
    refetch,
    updateProfile,
    updating,
    updateError,
  } = useReviewerProfileWithUpdate()

  const [formData, setFormData] = useState<UpdateReviewerProfileRequest>({
    name: "",
    profileImageUrl: "",
    proficiency: "",
  })
  const [hasChanges, setHasChanges] = useState(false)
  const [saved, setSaved] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Sync profile data to form
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.displayName || `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "",
        profileImageUrl: profile.profileImageUrl || "",
        proficiency: profile.proficiency || "",
      })
      setHasChanges(false)
    }
  }, [profile])

  const handleChange = (field: keyof UpdateReviewerProfileRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
    setSaved(false)
  }

  const handleSave = async () => {
    // Validate required fields
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
      await refreshUser() // Sync auth context so dashboard shows updated info
      trackEvent("reviewer_profile_updated", { fields: Object.keys(formData) })
      setSaved(true)
      setHasChanges(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      logError("Failed to save profile", err)
      setValidationError("Failed to save profile. Please try again.")
    }
  }

  // Error state
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
            <Link href="/reviewers/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              &larr; Back to Dashboard
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <div className="rounded-xl border border-destructive bg-destructive/5 p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-xl font-bold text-destructive">Failed to Load Profile</h2>
            <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
            <Button className="mt-4" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/reviewers/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            &larr; Back to Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <User className="h-6 w-6 text-accent" />
          <h1 className="text-2xl font-bold">Edit Profile</h1>
        </div>

        {/* Profile Info */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Label className="text-sm font-medium mb-3 block">Profile Photo</Label>
              {loading ? (
                <Skeleton className="w-32 h-32 rounded-lg" />
              ) : (
                <ImageUpload
                  type="REVIEWER_AVATAR"
                  currentImageUrl={formData.profileImageUrl}
                  onUploadComplete={(url) => handleChange("profileImageUrl", url)}
                  aspectRatio="square"
                />
              )}
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-4">
              {loading ? (
                <>
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Your display name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="proficiency">Language Proficiency</Label>
                    <Select
                      value={formData.proficiency}
                      onValueChange={(value) => handleChange("proficiency", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select your proficiency level" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROFICIENCY_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </div>

          {(updateError || validationError) && (
            <div className="mt-4 rounded-lg bg-destructive/10 border border-destructive/30 p-3">
              <p className="text-sm text-destructive">{validationError || updateError?.message}</p>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={updating || saved || !hasChanges || loading}>
              {updating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {saved ? "Saved!" : "Save Changes"}
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Account Stats (Read-only) */}
        {profile && (
          <Card className="p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4">Account Status</h2>
            <div className="space-y-4">
              {/* Qualification Status */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Qualification</span>
                {profile.qualificationPassed ? (
                  <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/30">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Passed
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                    <XCircle className="mr-1 h-3 w-3" />
                    Pending
                  </Badge>
                )}
              </div>

              {/* Quality Score */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Quality Score</span>
                <span className={`font-medium ${
                  profile.qualityScore >= 80 ? "text-green-600" :
                  profile.qualityScore >= 60 ? "text-amber-600" : "text-destructive"
                }`}>
                  {profile.qualityScore}/100
                </span>
              </div>

              {/* Tasks Completed */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tasks Completed</span>
                <span className="font-medium">{profile.tasksCompleted}</span>
              </div>

              {/* Total Earnings */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Earnings</span>
                <span className="font-medium">${profile.totalEarnings?.toFixed(2) ?? "0.00"}</span>
              </div>

              {/* Language */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Language</span>
                <span className="font-medium">{profile.language}</span>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
