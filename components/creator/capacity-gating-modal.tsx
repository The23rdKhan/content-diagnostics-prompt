"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export interface CapacityOption {
  id: string
  reviewers: number
  slaHours: number
  language: string
  available: boolean
  costMultiplier: number
}

interface CapacityGatingModalProps {
  isOpen: boolean
  selectedLanguage: string
  selectedSLA: "fast" | "standard" | "economy"
  onClose: () => void
  onSelect: (option: CapacityOption) => void
}

export function CapacityGatingModal({
  isOpen,
  selectedLanguage,
  selectedSLA,
  onClose,
  onSelect,
}: CapacityGatingModalProps) {
  if (!isOpen) return null

  // Mock capacity data - in production, fetch from server
  const capacityOptions: CapacityOption[] = [
    {
      id: "fast-english",
      reviewers: 5,
      slaHours: 24,
      language: "English",
      available: true,
      costMultiplier: 1.5,
    },
    {
      id: "standard-english",
      reviewers: 5,
      slaHours: 72,
      language: "English",
      available: true,
      costMultiplier: 1,
    },
    {
      id: "spanish-unavailable",
      reviewers: 3,
      slaHours: 48,
      language: "Spanish",
      available: false,
      costMultiplier: 1,
    },
  ]

  const selectedOption = capacityOptions.find((opt) => opt.language === selectedLanguage && opt.slaHours <= 72)
  const unavailableReasons = [
    {
      title: "Spanish reviewers at capacity",
      description: "All Spanish-speaking reviewers are currently booked",
      alternative: "Select English or try again in 24 hours",
    },
  ]

  if (!selectedOption?.available) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center text-destructive">
              <AlertCircle className="h-5 w-5" />
              Capacity Unavailable
            </CardTitle>
            <CardDescription>For {selectedLanguage} reviewers in your selected timeframe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive" className="bg-destructive/5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                We cannot guarantee minimum reviewers for your language and SLA combination right now.
              </AlertDescription>
            </Alert>

            <div>
              <h4 className="font-semibold mb-2 text-sm">Available Alternatives</h4>
              <ul className="space-y-2 text-sm">
                <li className="p-2 bg-secondary rounded">
                  <p className="font-medium">Option 1: Extend Delivery Window</p>
                  <p className="text-muted-foreground">Choose 7-day instead of 3-day delivery</p>
                  <Button size="sm" variant="outline" className="mt-1 bg-transparent" onClick={() => onClose()}>
                    Try with Standard SLA
                  </Button>
                </li>
                <li className="p-2 bg-secondary rounded">
                  <p className="font-medium">Option 2: Select Different Language</p>
                  <p className="text-muted-foreground">Switch to English or another available language</p>
                  <Button size="sm" variant="outline" className="mt-1 bg-transparent" onClick={() => onClose()}>
                    Change Language
                  </Button>
                </li>
                <li className="p-2 bg-secondary rounded">
                  <p className="font-medium">Option 3: Try Again Later</p>
                  <p className="text-muted-foreground">Check back in a few hours for availability</p>
                  <Button size="sm" variant="outline" className="mt-1 bg-transparent" onClick={() => onClose()}>
                    Close
                  </Button>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center text-accent">
            <CheckCircle2 className="h-5 w-5" />
            Capacity Confirmed
          </CardTitle>
          <CardDescription>For {selectedLanguage} reviewers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-accent/5 border-accent/30">
            <CheckCircle2 className="h-4 w-4 text-accent" />
            <AlertDescription className="text-accent">
              Guaranteed {selectedOption.reviewers} reviewers (completed feedback tasks from paid human reviewers),{" "}
              {selectedOption.slaHours}-hour delivery
            </AlertDescription>
          </Alert>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Minimum Reviewers:</span>
              <span className="font-semibold">{selectedOption.reviewers} paid</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Delivery:</span>
              <span className="font-semibold">{selectedOption.slaHours} hours</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-muted-foreground">Region:</span>
              <span className="font-semibold">{selectedLanguage} pool</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                onSelect(selectedOption)
                onClose()
              }}
              className="flex-1"
            >
              Confirm & Continue
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
