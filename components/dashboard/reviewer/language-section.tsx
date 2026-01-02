"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Check, AlertCircle, RefreshCw, Loader2, Save } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useReviewerProfileWithUpdate } from "@/lib/hooks/use-profile"
import { Alert, AlertDescription } from "@/components/ui/alert"

const allLanguages = [
  "English",
  "Spanish",
  "Portuguese",
  "French",
  "German",
  "Italian",
  "Dutch",
  "Russian",
  "Japanese",
  "Korean",
  "Chinese (Simplified)",
  "Chinese (Traditional)",
  "Arabic",
  "Hindi",
]

const proficiencyLevels = [
  { value: "NATIVE", label: "Native Speaker" },
  { value: "FLUENT", label: "Fluent" },
  { value: "ADVANCED", label: "Advanced" },
  { value: "INTERMEDIATE", label: "Intermediate" },
]

export function LanguageSection() {
  const { profile, loading, error, refetch, updateProfile, updating, updateError } = useReviewerProfileWithUpdate()
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English")
  const [selectedProficiency, setSelectedProficiency] = useState<string>("FLUENT")
  const [hasChanges, setHasChanges] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Sync profile data when loaded
  useEffect(() => {
    if (profile) {
      setSelectedLanguage(profile.language || "English")
      setSelectedProficiency(profile.proficiency || "FLUENT")
      setHasChanges(false)
    }
  }, [profile])

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language)
    setHasChanges(true)
    setSaveSuccess(false)
  }

  const handleProficiencySelect = (proficiency: string) => {
    setSelectedProficiency(proficiency)
    setHasChanges(true)
    setSaveSuccess(false)
  }

  const handleSave = async () => {
    try {
      await updateProfile({
        proficiency: selectedProficiency,
      })
      setSaveSuccess(true)
      setHasChanges(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error("Failed to save language profile:", err)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-5 w-40 mb-4" />
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-destructive bg-destructive/5 p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-bold text-destructive">Failed to Load Language Profile</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Button className="mt-4" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">Language Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select your primary review language. You will only see tasks in your selected language.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-card-foreground mb-4">Your Primary Language</h3>
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
            <Check className="h-4 w-4" />
            {selectedLanguage}
          </span>
          {selectedProficiency && (
            <span className="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
              {proficiencyLevels.find(p => p.value === selectedProficiency)?.label || selectedProficiency}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-card-foreground mb-4">Select Language</h3>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {allLanguages.map((language) => {
            const isSelected = selectedLanguage === language
            return (
              <button
                key={language}
                onClick={() => handleLanguageSelect(language)}
                disabled={updating}
                className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                  isSelected ? "border-accent bg-accent/5" : "border-border hover:bg-secondary"
                } ${updating ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className="text-foreground">{language}</span>
                {isSelected && <Check className="h-4 w-4 text-accent" />}
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-card-foreground mb-4">Language Proficiency</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select your proficiency level for {selectedLanguage}.
        </p>
        <div className="grid gap-2 md:grid-cols-2">
          {proficiencyLevels.map((level) => {
            const isSelected = selectedProficiency === level.value
            return (
              <button
                key={level.value}
                onClick={() => handleProficiencySelect(level.value)}
                disabled={updating}
                className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                  isSelected ? "border-accent bg-accent/5" : "border-border hover:bg-secondary"
                } ${updating ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className="text-foreground">{level.label}</span>
                {isSelected && <Check className="h-4 w-4 text-accent" />}
              </button>
            )
          })}
        </div>
      </div>

      {updateError && (
        <Alert className="border-destructive/30 bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            {updateError.message}
          </AlertDescription>
        </Alert>
      )}

      {saveSuccess && (
        <Alert className="border-green-500/30 bg-green-500/10">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">
            Language profile saved successfully!
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updating || !hasChanges}>
          {updating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {saveSuccess ? "Saved!" : "Save Language Profile"}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
