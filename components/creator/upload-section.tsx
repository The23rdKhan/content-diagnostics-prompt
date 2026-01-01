"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CapacityGatingModal } from "./capacity-gating-modal"
import { trackEvent } from "@/lib/analytics"
import { Upload, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function UploadSection() {
  const [showCapacityGating, setShowCapacityGating] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("English")
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleUploadClick = () => {
    trackEvent("upload_started")
    setShowCapacityGating(true)
  }

  const handleCapacityConfirmed = () => {
    trackEvent("upload_confirmed", { language: selectedLanguage })
    alert(`Upload confirmed for ${selectedLanguage} reviewers. Mock upload in progress...`)
    // In production, initiate file upload here
    setUploadedFile({ name: "sample_video.mp4" } as File)
    trackEvent("upload_completed", { filename: "sample_video.mp4" })
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      trackEvent("video_dropped", { filename: e.dataTransfer.files[0].name })
      setUploadedFile(e.dataTransfer.files[0])
    }
  }

  return (
    <div className="space-y-6">
      <CapacityGatingModal
        isOpen={showCapacityGating}
        selectedLanguage={selectedLanguage}
        selectedSLA="standard"
        onClose={() => setShowCapacityGating(false)}
        onSelect={() => handleCapacityConfirmed()}
      />

      <Card>
        <CardHeader>
          <CardTitle>Upload Video for Review</CardTitle>
          <CardDescription>Submit your content for AI analysis and human feedback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language selection */}
          <div>
            <label className="text-sm font-medium block mb-2">Select Reviewer Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Japanese</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Your video will be reviewed by speakers of this language
            </p>
          </div>

          {/* Capacity info */}
          <Alert className="bg-accent/5 border-accent/30">
            <AlertCircle className="h-4 w-4 text-accent" />
            <AlertDescription className="text-sm">
              <strong>Guaranteed minimum reviewers:</strong> 5 for your plan | <strong>Estimated delivery:</strong> 3
              days
            </AlertDescription>
          </Alert>

          {/* Upload area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
            }`}
          >
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Drag and drop your video</h3>
            <p className="text-sm text-muted-foreground mb-4">or click button below to select</p>
            <Button
              variant="outline"
              className="bg-transparent"
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              Select Video
            </Button>
            <input type="file" id="fileInput" className="hidden" accept="video/*" />
          </div>

          {/* Upload info */}
          <div className="space-y-2 text-sm">
            <h4 className="font-semibold">Supported Formats</h4>
            <p className="text-muted-foreground">MP4, MOV, WebM • Max size: 5GB • Any duration</p>
          </div>

          {/* File info */}
          {uploadedFile && (
            <div className="p-4 bg-secondary rounded-lg">
              <p className="font-medium text-sm mb-2">Selected file:</p>
              <p className="text-sm text-muted-foreground">{uploadedFile.name}</p>
            </div>
          )}

          {/* Upload button */}
          <Button onClick={handleUploadClick} size="lg" className="w-full" disabled={!uploadedFile}>
            Check Capacity & Upload
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
