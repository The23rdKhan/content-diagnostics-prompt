"use client"

import { logError } from "@/lib/error-tracking"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileVideo, X, CheckCircle, ChevronRight, ChevronLeft, AlertCircle, RefreshCw, Coins, Loader2 } from "lucide-react"
import { trackEvent } from "@/lib/analytics"
import { CapacityGatingModal, type CapacityOption } from "@/components/creator/capacity-gating-modal"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useVideoUpload } from "@/lib/hooks/use-upload"
import { useCreditBalance, useCreditBundles, usePurchaseCredits } from "@/lib/hooks/use-credits"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type UploadStep = "select-file" | "video-details" | "capacity-review" | "add-ons" | "submit"

const contentTypes = ["Stream rehearsal", "Course", "Marketing", "Training", "Other"]
const primaryGoals = ["Improve clarity", "Improve pacing", "Improve hook", "Improve structure"]

const slaOptions = [
  { value: "fast", label: "Fast (24 hours)", hours: 24, multiplier: 1.5 },
  { value: "standard", label: "Standard (48 hours)", hours: 48, multiplier: 1 },
  { value: "economy", label: "Economy (72 hours)", hours: 72, multiplier: 0.8 },
]

export function UploadSection() {
  const [currentStep, setCurrentStep] = useState<UploadStep>("select-file")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false)
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null)

  // Upload hook
  const { state: uploadState, uploadVideo, retry, reset: resetUpload } = useVideoUpload()

  // Credit hooks
  const { balance: creditBalance, creditsPerVideo, loading: creditsLoading, refetch: refetchCredits } = useCreditBalance()
  const { bundles, loading: bundlesLoading } = useCreditBundles()
  const { purchaseCredits, loading: purchasing } = usePurchaseCredits()

  const hasEnoughCredits = creditBalance >= creditsPerVideo

  // Form state
  const [videoTitle, setVideoTitle] = useState("")
  const [selectedLanguage] = useState("English")
  const [contentType, setContentType] = useState("")
  const [primaryGoal, setPrimaryGoal] = useState("")
  const [selectedSLA, setSelectedSLA] = useState<"fast" | "standard" | "economy">("standard")
  const [optionalNotes, setOptionalNotes] = useState("")
  const [capacityConfirmed, setCapacityConfirmed] = useState(false)
  const [showCapacityModal, setShowCapacityModal] = useState(false)
  const [videoDurationMinutes, setVideoDurationMinutes] = useState<number | null>(null)
  const [contentCertified, setContentCertified] = useState(false)

  // Reviewer count based on plan (5/10/15 for basic/pro/enterprise)
  // Research shows signal saturates at 5-12 reviewers, so we use smaller pools
  // TODO: Get from user's subscription plan - for now default to Professional (10)
  const reviewerCount = 10

  // Add-ons state
  const [addons, setAddons] = useState({
    extraReviewers: null as null | 2 | 5,
    fasterDelivery: false,
    fullWatchSummary: false,
    liveFeedback: false,
  })

  // Derived state from upload hook
  const uploadProgress = uploadState.progress
  const isUploading = uploadState.stage !== "idle" && uploadState.stage !== "complete" && uploadState.stage !== "error"
  const uploadError = uploadState.error
  const uploadComplete = uploadState.stage === "complete"

  const steps: { key: UploadStep; label: string }[] = [
    { key: "select-file", label: "Select File" },
    { key: "video-details", label: "Video Details" },
    { key: "capacity-review", label: "Capacity & SLA" },
    { key: "add-ons", label: "Add-ons" },
    { key: "submit", label: "Submit" },
  ]

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0 && files[0].type.startsWith("video/")) {
      const file = files[0]
      setUploadedFile(file)
      setVideoTitle(file.name.replace(/\.[^/.]+$/, ""))
      trackEvent("creator_upload_started", { fileName: file.name, fileSize: file.size })

      // Extract video duration from file metadata
      const video = document.createElement("video")
      video.preload = "metadata"
      video.onloadedmetadata = () => {
        setVideoDurationMinutes(Math.ceil(video.duration / 60))
        URL.revokeObjectURL(video.src)
      }
      video.src = URL.createObjectURL(file)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      setUploadedFile(file)
      setVideoTitle(file.name.replace(/\.[^/.]+$/, ""))
      trackEvent("creator_upload_started", { fileName: file.name, fileSize: file.size })

      // Extract video duration from file metadata
      const video = document.createElement("video")
      video.preload = "metadata"
      video.onloadedmetadata = () => {
        setVideoDurationMinutes(Math.ceil(video.duration / 60))
        URL.revokeObjectURL(video.src)
      }
      video.src = URL.createObjectURL(file)
    }
  }

  const clearFile = () => {
    setUploadedFile(null)
    setVideoTitle("")
    setOptionalNotes("")
    setContentType("")
    setPrimaryGoal("")
    setCurrentStep("select-file")
    setCapacityConfirmed(false)
    setVideoDurationMinutes(null)
    setContentCertified(false)
    setAddons({
      extraReviewers: null,
      fasterDelivery: false,
      fullWatchSummary: false,
      liveFeedback: false,
    })
    resetUpload()
  }

  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].key)
    }
  }

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].key)
    }
  }

  const handleCapacityCheck = () => {
    setShowCapacityModal(true)
  }

  const handleCapacitySelect = (option: CapacityOption) => {
    setCapacityConfirmed(true)
    trackEvent("creator_capacity_confirmed", {
      language: option.language,
      slaHours: option.slaHours,
      reviewers: option.reviewers,
    })
  }

  const handleAddonToggle = (addon: keyof typeof addons, value: any) => {
    setAddons((prev) => ({ ...prev, [addon]: value }))
    trackEvent("creator_addon_selected", { addon, value })
  }

  const handleBuyCredits = async (bundleId: string) => {
    try {
      await purchaseCredits(bundleId)
      setShowBuyCreditsModal(false)
    } catch (err) {
      logError("Failed to purchase credits", err)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const handleUpload = async () => {
    if (!uploadedFile) return

    const selectedSLAOption = slaOptions.find((o) => o.value === selectedSLA)!

    trackEvent("creator_job_submitted", {
      title: videoTitle,
      language: selectedLanguage,
      sla: selectedSLA,
      addons,
    })

    try {
      const result = await uploadVideo(
        uploadedFile,
        {
          title: videoTitle,
          language: selectedLanguage,
          contentType: contentType || undefined,
          primaryGoal: primaryGoal || undefined,
          notes: optionalNotes || undefined,
        },
        {
          slaHours: selectedSLAOption.hours,
          extraReviewers: addons.extraReviewers || undefined,
          fasterDelivery: addons.fasterDelivery,
          fullWatchSummary: addons.fullWatchSummary,
        }
      )

      trackEvent("creator_upload_completed", {
        title: videoTitle,
        videoId: result.videoId,
        jobId: result.jobId,
      })
    } catch (error) {
      logError("Upload failed", error)
      trackEvent("creator_upload_failed", {
        title: videoTitle,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  const handleRetry = async () => {
    if (!uploadedFile) return

    const selectedSLAOption = slaOptions.find((o) => o.value === selectedSLA)!

    try {
      await retry(
        uploadedFile,
        {
          title: videoTitle,
          language: selectedLanguage,
          contentType: contentType || undefined,
          primaryGoal: primaryGoal || undefined,
          notes: optionalNotes || undefined,
        },
        {
          slaHours: selectedSLAOption.hours,
          extraReviewers: addons.extraReviewers || undefined,
          fasterDelivery: addons.fasterDelivery,
          fullWatchSummary: addons.fullWatchSummary,
        }
      )
    } catch (error) {
      logError("Retry failed", error)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case "select-file":
        return (
          <div>
            {!uploadedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
                  isDragging ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground"
                }`}
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-foreground">Drag and drop your video here</p>
                <p className="mt-1 text-sm text-muted-foreground">or</p>
                <label className="mt-4 inline-block">
                  <input type="file" accept="video/*" onChange={handleFileSelect} className="sr-only" />
                  <Button variant="outline" className="cursor-pointer bg-transparent" asChild>
                    <span>Browse Files</span>
                  </Button>
                </label>
                <p className="mt-4 text-xs text-muted-foreground">Supports MP4, MOV, AVI, WebM • Max 500MB</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-secondary p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                        <FileVideo className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button onClick={clearFile} className="text-muted-foreground hover:text-foreground">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <Button onClick={goToNextStep} className="w-full">
                  Continue to Video Details <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )

      case "video-details":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="video-title">Video Title</Label>
              <Input
                id="video-title"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Enter a descriptive title"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="language">Primary Content Language *</Label>
              <Input id="language" value="English" disabled className="mt-1.5 bg-muted cursor-not-allowed" />
              <p className="mt-1 text-xs text-muted-foreground">
                Language availability affects turnaround times. MVP supports English only.
              </p>
            </div>
            <div>
              <Label htmlFor="content-type">Content Type (optional)</Label>
              <select
                id="content-type"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Select type...</option>
                {contentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="primary-goal">Primary Goal (optional)</Label>
              <select
                id="primary-goal"
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Select goal...</option>
                {primaryGoals.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="notes">Optional Notes (for reviewers)</Label>
              <Textarea
                id="notes"
                value={optionalNotes}
                onChange={(e) => setOptionalNotes(e.target.value)}
                placeholder="Any context or specific areas you'd like reviewers to focus on..."
                className="mt-1.5"
                rows={3}
              />
            </div>

            {/* Content Certification */}
            <div className="rounded-lg border border-border bg-secondary/50 p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="content-certification"
                  checked={contentCertified}
                  onCheckedChange={(checked) => setContentCertified(checked === true)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label htmlFor="content-certification" className="font-medium cursor-pointer">
                    Content Certification *
                  </Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    I certify that this video does not contain explicit, violent, hateful, or illegal content.
                    I understand that reviewers may report inappropriate content, and violations may result in account suspension.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={goToPreviousStep} className="flex-1 bg-transparent">
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={goToNextStep} className="flex-1" disabled={!videoTitle.trim() || !contentCertified}>
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )

      case "capacity-review":
        return (
          <div className="space-y-4">
            <div>
              <Label>Select Delivery Window</Label>
              <div className="mt-2 space-y-2">
                {slaOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedSLA(option.value as any)}
                    className={`w-full rounded-lg border p-4 text-left transition-colors ${
                      selectedSLA === option.value
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{option.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {option.multiplier > 1
                            ? `+${((option.multiplier - 1) * 100).toFixed(0)}% cost`
                            : option.multiplier < 1
                              ? `${((1 - option.multiplier) * 100).toFixed(0)}% savings`
                              : "Standard pricing"}
                        </p>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border-2 ${
                          selectedSLA === option.value ? "border-accent bg-accent" : "border-border"
                        }`}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {!capacityConfirmed && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Check capacity availability before proceeding</AlertDescription>
              </Alert>
            )}

            {capacityConfirmed && (
              <Alert className="bg-accent/5 border-accent/30">
                <CheckCircle className="h-4 w-4 text-accent" />
                <AlertDescription className="text-accent">
                  Capacity confirmed: Guaranteed {reviewerCount} reviewers (completed feedback tasks from paid human reviewers),{" "}
                  {slaOptions.find((o) => o.value === selectedSLA)?.hours}
                  -hour delivery
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={goToPreviousStep} className="flex-1 bg-transparent">
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              {!capacityConfirmed ? (
                <Button onClick={handleCapacityCheck} className="flex-1">
                  Check Capacity
                </Button>
              ) : (
                <Button onClick={goToNextStep} className="flex-1">
                  Continue <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )

      case "add-ons":
        const videoLengthMinutes = videoDurationMinutes || 0
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Optional enhancements to improve your report quality</p>

            <div className="space-y-3">
              {/* Extra Reviewers */}
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">Extra Reviewers</p>
                      <span className="text-xs text-accent">+$5 or +$10</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Get feedback from more paid reviewers</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={addons.extraReviewers === 2 ? "default" : "outline"}
                      onClick={() => handleAddonToggle("extraReviewers", addons.extraReviewers === 2 ? null : 2)}
                      className={addons.extraReviewers !== 2 ? "bg-transparent" : ""}
                    >
                      +2
                    </Button>
                    <Button
                      size="sm"
                      variant={addons.extraReviewers === 5 ? "default" : "outline"}
                      onClick={() => handleAddonToggle("extraReviewers", addons.extraReviewers === 5 ? null : 5)}
                      className={addons.extraReviewers !== 5 ? "bg-transparent" : ""}
                    >
                      +5
                    </Button>
                  </div>
                </div>
              </div>

              {/* Faster Delivery */}
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">Priority Delivery</p>
                      <span className="text-xs text-accent">+$15</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Move to front of reviewer queue</p>
                  </div>
                  <Checkbox
                    checked={addons.fasterDelivery}
                    onCheckedChange={(checked) => handleAddonToggle("fasterDelivery", checked)}
                  />
                </div>
              </div>

              {/* Full-Watch Summary */}
              {videoLengthMinutes > 20 && (
                <div className="rounded-lg border border-accent bg-accent/5 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">Full-Watch Reviewer Summary</p>
                        <span className="rounded bg-accent px-1.5 py-0.5 text-xs text-white">Recommended</span>
                        <span className="text-xs text-accent">+$25</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Guaranteed reviewers who watch your entire {videoLengthMinutes}-minute video
                      </p>
                    </div>
                    <Checkbox
                      checked={addons.fullWatchSummary}
                      onCheckedChange={(checked) => handleAddonToggle("fullWatchSummary", checked)}
                    />
                  </div>
                </div>
              )}

              {/* Live Feedback */}
              <div className="rounded-lg border border-border p-4 opacity-60">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">Live Private Feedback Session</p>
                      <span className="text-xs text-muted-foreground">Limited availability</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Schedule a live call with a senior reviewer (when available)
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 bg-transparent"
                      onClick={() => alert("Request a slot - feature coming soon")}
                    >
                      Request Slot
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={goToPreviousStep} className="flex-1 bg-transparent">
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={goToNextStep} className="flex-1">
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )

      case "submit":
        const selectedSLAOption = slaOptions.find((o) => o.value === selectedSLA)!
        const totalReviewers = reviewerCount + (addons.extraReviewers || 0)

        // Get stage-specific status message
        const getUploadStatusMessage = () => {
          switch (uploadState.stage) {
            case "presigning":
              return "Preparing upload..."
            case "uploading":
              return "Uploading to storage..."
            case "creating-video":
              return "Creating video record..."
            case "submitting-job":
              return "Submitting job..."
            default:
              return "Uploading..."
          }
        }

        return (
          <div className="space-y-4">
            {/* Credit Balance Display */}
            <div className={`rounded-lg border p-4 ${hasEnoughCredits ? 'border-accent/30 bg-accent/5' : 'border-destructive bg-destructive/5'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className={`h-5 w-5 ${hasEnoughCredits ? 'text-accent' : 'text-destructive'}`} />
                  <div>
                    <p className="font-medium text-foreground">
                      {creditsLoading ? 'Loading...' : `${creditBalance} credits available`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {creditsPerVideo} credits required for this submission
                    </p>
                  </div>
                </div>
                {!hasEnoughCredits && !creditsLoading && (
                  <Button size="sm" onClick={() => setShowBuyCreditsModal(true)}>
                    <Coins className="mr-2 h-4 w-4" />
                    Buy Credits
                  </Button>
                )}
              </div>
            </div>

            {/* Insufficient Credits Warning */}
            {!hasEnoughCredits && !creditsLoading && (
              <Alert className="border-destructive bg-destructive/5">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  You need {creditsPerVideo - creditBalance} more credits to submit this video.
                  Purchase credits to continue.
                </AlertDescription>
              </Alert>
            )}

            {hasEnoughCredits && !uploadError && !uploadComplete && (
              <Alert>
                <CheckCircle className="h-4 w-4 text-accent" />
                <AlertDescription>Review your submission details before uploading</AlertDescription>
              </Alert>
            )}

            <div className="rounded-lg border border-border p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Video:</span>
                <span className="font-medium">{videoTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Language:</span>
                <span className="font-medium">{selectedLanguage}</span>
              </div>
              {contentType && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Content Type:</span>
                  <span className="font-medium">{contentType}</span>
                </div>
              )}
              {primaryGoal && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Primary Goal:</span>
                  <span className="font-medium">{primaryGoal}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Window:</span>
                <span className="font-medium">{selectedSLAOption.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Guaranteed Reviewers:</span>
                <span className="font-medium">{totalReviewers} paid reviewers</span>
              </div>
              {Object.entries(addons).some(([_, v]) => v) && (
                <>
                  <div className="border-t border-border pt-2">
                    <p className="text-muted-foreground mb-1">Add-ons:</p>
                    {addons.extraReviewers && (
                      <p className="text-foreground">• Extra {addons.extraReviewers} reviewers</p>
                    )}
                    {addons.fasterDelivery && <p className="text-foreground">• Priority delivery</p>}
                    {addons.fullWatchSummary && <p className="text-foreground">• Full-watch summary</p>}
                  </div>
                </>
              )}
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{getUploadStatusMessage()}</span>
                  <span className="text-foreground">{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-accent transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error State */}
            {uploadError && (
              <Alert className="border-destructive bg-destructive/5">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  Upload failed: {uploadError}
                </AlertDescription>
              </Alert>
            )}

            {/* Success State */}
            {uploadComplete && (
              <Alert className="bg-accent/5 border-accent/30">
                <CheckCircle className="h-4 w-4 text-accent" />
                <AlertDescription className="text-accent">
                  Upload complete! Your video is now in the review queue.
                  {uploadState.jobId && <span className="block mt-1">Job ID: {uploadState.jobId}</span>}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                className="flex-1 bg-transparent"
                disabled={isUploading || uploadComplete}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>

              {/* Error: Show Retry button */}
              {uploadError && (
                <Button onClick={handleRetry} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Upload
                </Button>
              )}

              {/* Idle: Show Submit button or Buy Credits if insufficient */}
              {!isUploading && !uploadComplete && !uploadError && hasEnoughCredits && (
                <Button onClick={handleUpload} className="flex-1">
                  Submit Job
                </Button>
              )}

              {/* Not enough credits: Show Buy Credits button */}
              {!isUploading && !uploadComplete && !uploadError && !hasEnoughCredits && (
                <Button onClick={() => setShowBuyCreditsModal(true)} className="flex-1">
                  <Coins className="mr-2 h-4 w-4" />
                  Buy Credits to Submit
                </Button>
              )}

              {/* Uploading: Show disabled button */}
              {isUploading && (
                <Button className="flex-1" disabled>
                  Uploading...
                </Button>
              )}

              {/* Complete: Show Upload Another button */}
              {uploadComplete && (
                <Button onClick={clearFile} className="flex-1">
                  Upload Another Video
                </Button>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-card-foreground mb-2">Upload Video for Review</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Upload pre-recorded content to receive AI diagnostics and paid human reviewer feedback.
        </p>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                      index <= currentStepIndex
                        ? "border-accent bg-accent text-white"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {index < currentStepIndex ? <CheckCircle className="h-5 w-5" /> : index + 1}
                  </div>
                  <p
                    className={`mt-1 text-xs ${index <= currentStepIndex ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {step.label}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 ${index < currentStepIndex ? "bg-accent" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {renderStepContent()}

        {currentStep !== "select-file" && (
          <div className="mt-6 rounded-lg bg-secondary p-4">
            <h3 className="text-sm font-semibold text-secondary-foreground">What happens next?</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• AI diagnostics run instantly after upload</li>
              <li>• Paid human reviewers complete feedback tasks</li>
              <li>• Feedback is aggregated into a report within your selected timeframe</li>
            </ul>
          </div>
        )}
      </div>

      <CapacityGatingModal
        isOpen={showCapacityModal}
        selectedLanguage={selectedLanguage}
        selectedSLA={selectedSLA}
        onClose={() => setShowCapacityModal(false)}
        onSelect={handleCapacitySelect}
      />

      {/* Buy Credits Modal */}
      <Dialog open={showBuyCreditsModal} onOpenChange={setShowBuyCreditsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Purchase Credits</DialogTitle>
            <DialogDescription>
              You need {creditsPerVideo} credits to submit a video. Choose a bundle below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            {bundles.map((bundle) => (
              <div
                key={bundle.id}
                className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all hover:border-accent/50 ${
                  selectedBundle === bundle.id
                    ? "border-accent bg-accent/5"
                    : "border-border"
                }`}
                onClick={() => setSelectedBundle(bundle.id)}
              >
                {bundle.popular && (
                  <span className="absolute -top-2 -right-2 rounded bg-accent px-2 py-0.5 text-xs text-white">
                    Popular
                  </span>
                )}
                <h3 className="font-semibold text-foreground">{bundle.name}</h3>
                <p className="text-2xl font-bold text-accent mt-1">{bundle.credits} credits</p>
                <p className="text-sm text-muted-foreground">{bundle.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-semibold">{formatCurrency(bundle.price)}</span>
                  {bundle.savingsPercent > 0 && (
                    <span className="text-xs text-green-600">Save {bundle.savingsPercent}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowBuyCreditsModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedBundle && handleBuyCredits(selectedBundle)}
              disabled={!selectedBundle || purchasing}
            >
              {purchasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Coins className="mr-2 h-4 w-4" />
                  Purchase Credits
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
