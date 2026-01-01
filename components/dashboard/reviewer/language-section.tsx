"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Plus } from "lucide-react"

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

export function LanguageSection() {
  const [selectedLanguages, setSelectedLanguages] = useState(["English", "Spanish"])

  const toggleLanguage = (language: string) => {
    if (selectedLanguages.includes(language)) {
      setSelectedLanguages(selectedLanguages.filter((l) => l !== language))
    } else {
      setSelectedLanguages([...selectedLanguages, language])
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">Language Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select the languages you can review content in. You will only see tasks in your selected languages.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-card-foreground mb-4">Your Languages ({selectedLanguages.length})</h3>
        <div className="flex flex-wrap gap-2">
          {selectedLanguages.map((language) => (
            <span
              key={language}
              className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
            >
              <Check className="h-4 w-4" />
              {language}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-card-foreground mb-4">Available Languages</h3>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {allLanguages.map((language) => {
            const isSelected = selectedLanguages.includes(language)
            return (
              <button
                key={language}
                onClick={() => toggleLanguage(language)}
                className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                  isSelected ? "border-accent bg-accent/5" : "border-border hover:bg-secondary"
                }`}
              >
                <span className="text-foreground">{language}</span>
                {isSelected ? (
                  <Check className="h-4 w-4 text-accent" />
                ) : (
                  <Plus className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-card-foreground mb-4">Language Proficiency</h3>
        <p className="text-sm text-muted-foreground mb-4">
          By selecting a language, you confirm that you can understand spoken content in that language fluently.
        </p>
        <Button>Save Language Profile</Button>
      </div>
    </div>
  )
}
