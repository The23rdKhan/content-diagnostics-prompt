"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function CreatorAddOns() {
  const [purchasedAddons, setPurchasedAddons] = useState<string[]>([])
  const [showConfirm, setShowConfirm] = useState(false)
  const [selectedAddon, setSelectedAddon] = useState<string | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)

  const addons = [
    {
      id: "extra-reviewers",
      name: "Extra Reviewers",
      description: "Add 2 more paid human reviewers to your submission",
      price: 30,
      icon: "👥",
      benefits: ["Diverse perspectives", "More detailed feedback", "Higher confidence in insights"],
      availability: "Always available",
    },
    {
      id: "faster-delivery",
      name: "Faster Delivery",
      description: "Cut your delivery time in half for urgent feedback",
      price: 25,
      icon: "⚡",
      benefits: ["Get results in 12-24 hours instead", "Priority queue access", "Weekend support"],
      availability: "Availability varies",
    },
    {
      id: "full-watch",
      name: "Full Watch Guarantee",
      description: "Ensure every reviewer watches your entire video",
      price: 20,
      icon: "👁️",
      benefits: ["Every reviewer watches full video", "No partial reviews", "More comprehensive feedback"],
      availability: "Always available",
    },
    {
      id: "live-feedback",
      name: "Live Feedback Session",
      description: "Optional 30-min video call with a lead reviewer",
      price: 50,
      icon: "🎥",
      benefits: ["Real-time Q&A", "Deep-dive discussion", "Strategic recommendations"],
      availability: "Availability required",
      disabled: true,
    },
  ]

  const handleSelectAddon = (addonId: string) => {
    const addon = addons.find((a) => a.id === addonId)
    if (addon?.disabled) {
      setPurchaseError("This add-on requires availability slots. Check back later.")
      setTimeout(() => setPurchaseError(null), 5000)
      return
    }

    setPurchaseError(null)
    setPurchaseSuccess(null)
    setSelectedAddon(addonId)
    setShowConfirm(true)
  }

  const handlePurchaseAddon = async () => {
    if (!selectedAddon || purchasedAddons.includes(selectedAddon)) return

    setIsPurchasing(true)
    setPurchaseError(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      const addon = addons.find((a) => a.id === selectedAddon)
      setPurchasedAddons([...purchasedAddons, selectedAddon])
      setPurchaseSuccess(`${addon?.name} purchased successfully!`)
      setTimeout(() => setPurchaseSuccess(null), 5000)
    } catch {
      setPurchaseError("Failed to purchase add-on. Please try again.")
    } finally {
      setIsPurchasing(false)
      setShowConfirm(false)
      setSelectedAddon(null)
    }
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Add-ons & Enhancements</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Enhance your review package with optional add-ons for better insights and faster delivery.
        </p>

        {/* Demo Mode Banner */}
        <div className="mb-6 rounded-lg border-2 border-dashed border-amber-500/50 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">!</span>
            <div>
              <p className="font-semibold text-amber-700 dark:text-amber-400">Demo Mode</p>
              <p className="text-sm text-amber-600 dark:text-amber-500">
                This is a preview of the add-ons interface. No real purchases will be processed.
              </p>
            </div>
          </div>
        </div>

        {/* Success/Error alerts */}
        {purchaseSuccess && (
          <Alert className="mb-6 border-green-500/30 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">{purchaseSuccess}</AlertDescription>
          </Alert>
        )}
        {purchaseError && (
          <Alert className="mb-6 border-destructive/30 bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">{purchaseError}</AlertDescription>
          </Alert>
        )}

        {/* Add-on cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {addons.map((addon) => (
            <Card key={addon.id} className={addon.disabled ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{addon.icon}</span>
                      <CardTitle>{addon.name}</CardTitle>
                    </div>
                    <CardDescription>{addon.description}</CardDescription>
                  </div>
                  {purchasedAddons.includes(addon.id) && <Badge className="bg-green-600">Purchased</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-accent">${addon.price}</div>

                <div>
                  <h4 className="font-semibold mb-2 text-sm">Benefits</h4>
                  <ul className="space-y-1">
                    {addon.benefits.map((benefit) => (
                      <li key={benefit} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-accent">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3">
                    {addon.availability === "Availability required" ? (
                      <span className="text-yellow-600">⚠️ {addon.availability}</span>
                    ) : (
                      <span>✓ {addon.availability}</span>
                    )}
                  </p>
                  <Button
                    onClick={() => handleSelectAddon(addon.id)}
                    disabled={purchasedAddons.includes(addon.id) || addon.disabled}
                    className="w-full"
                  >
                    {purchasedAddons.includes(addon.id) ? (
                      "Already Purchased"
                    ) : addon.disabled ? (
                      "Not Available"
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Confirmation modal */}
        {showConfirm && selectedAddon && (
          <Card className="fixed inset-4 m-auto w-full max-w-md border-2 border-accent bg-card z-50 shadow-lg">
            <CardHeader>
              <CardTitle>Confirm Add-on Purchase</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {addons.find((a) => a.id === selectedAddon)?.name} - $
                {addons.find((a) => a.id === selectedAddon)?.price}
              </p>
              <p className="text-sm text-muted-foreground">
                This add-on will be available for your next video submission.
              </p>
              <div className="flex gap-3">
                <Button onClick={handlePurchaseAddon} disabled={isPurchasing} className="flex-1">
                  {isPurchasing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Purchase"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={isPurchasing} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchased add-ons section */}
        {purchasedAddons.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Your Purchased Add-ons</h2>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {purchasedAddons.map((addonId) => {
                    const addon = addons.find((a) => a.id === addonId)
                    return (
                      <li key={addonId} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div>
                          <p className="font-medium">{addon?.name}</p>
                          <p className="text-sm text-muted-foreground">${addon?.price}</p>
                        </div>
                        <Badge className="bg-green-600">Active</Badge>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
