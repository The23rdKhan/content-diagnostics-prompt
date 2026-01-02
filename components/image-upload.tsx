"use client"

import { useState, useCallback, useRef } from "react"
import { Upload, X, Loader2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

// =============================================================================
// Types
// =============================================================================

export type ImageUploadType = "CREATOR_AVATAR" | "CREATOR_BANNER" | "REVIEWER_AVATAR"

interface PresignResponse {
  uploadUrl: string
  fileUrl: string
  key: string
  expiresAt: string
  requiredHeaders: Record<string, string>
}

interface ImageUploadProps {
  type: ImageUploadType
  currentImageUrl?: string
  onUploadComplete: (url: string) => void
  onUploadError?: (error: string) => void
  aspectRatio?: "square" | "banner"
  className?: string
}

// =============================================================================
// Component
// =============================================================================

export function ImageUpload({
  type,
  currentImageUrl,
  onUploadComplete,
  onUploadError,
  aspectRatio = "square",
  className,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
  const maxSize = type === "CREATOR_BANNER" ? 20 * 1024 * 1024 : 10 * 1024 * 1024 // 20MB for banner, 10MB for avatars

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        const errorMsg = "Please select a JPEG, PNG, or WebP image"
        setError(errorMsg)
        onUploadError?.(errorMsg)
        return
      }

      // Validate file size
      if (file.size > maxSize) {
        const maxMB = maxSize / (1024 * 1024)
        const errorMsg = `Image must be smaller than ${maxMB}MB`
        setError(errorMsg)
        onUploadError?.(errorMsg)
        return
      }

      setError(null)
      setUploading(true)
      setProgress(0)

      // Show local preview immediately
      const localPreview = URL.createObjectURL(file)
      setPreview(localPreview)

      try {
        // Step 1: Get presigned URL
        setProgress(10)
        const presignResponse = await api.post<PresignResponse>("/storage/presign", {
          type,
          filename: file.name,
          contentType: file.type,
          contentLength: file.size,
        })

        // Step 2: Upload to S3
        setProgress(20)
        await uploadToS3(file, presignResponse.uploadUrl, presignResponse.requiredHeaders)

        // Step 3: Complete
        setProgress(100)
        setPreview(presignResponse.fileUrl)
        onUploadComplete(presignResponse.fileUrl)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Upload failed"
        setError(errorMsg)
        onUploadError?.(errorMsg)
        // Revert to previous image on error
        setPreview(currentImageUrl || null)
        URL.revokeObjectURL(localPreview)
      } finally {
        setUploading(false)
        setProgress(0)
      }
    },
    [type, currentImageUrl, onUploadComplete, onUploadError, maxSize]
  )

  const uploadToS3 = (
    file: File,
    uploadUrl: string,
    headers: Record<string, string>
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhrRef.current = xhr

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = 20 + Math.round((event.loaded / event.total) * 70)
          setProgress(percentComplete)
        }
      })

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"))
      })

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload cancelled"))
      })

      xhr.open("PUT", uploadUrl)

      // Set required headers
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value)
      })

      xhr.send(file)
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // Reset input so same file can be selected again
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleRemove = () => {
    setPreview(null)
    setError(null)
    onUploadComplete("")
  }

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click()
    }
  }

  const isBanner = aspectRatio === "banner"

  return (
    <div className={cn("relative", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(",")}
        onChange={handleInputChange}
        className="hidden"
        disabled={uploading}
      />

      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          "relative border-2 border-dashed border-border rounded-lg overflow-hidden cursor-pointer transition-colors hover:border-accent",
          isBanner ? "aspect-[3/1]" : "aspect-square w-32",
          uploading && "cursor-not-allowed opacity-70",
          error && "border-destructive"
        )}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
            <span className="text-xs text-center px-2">
              {isBanner ? "Click or drag to upload banner" : "Click or drag"}
            </span>
          </div>
        )}

        {/* Upload overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
        )}

        {/* Hover overlay */}
        {!uploading && preview && (
          <div className="absolute inset-0 bg-background/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <Upload className="h-6 w-6 text-foreground" />
          </div>
        )}
      </div>

      {/* Remove button */}
      {preview && !uploading && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
          onClick={(e) => {
            e.stopPropagation()
            handleRemove()
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
