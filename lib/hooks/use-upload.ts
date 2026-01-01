"use client"

import { useState, useCallback, useRef } from "react"
import { api } from "@/lib/api"

// =============================================================================
// Types
// =============================================================================

export interface PresignResponse {
  uploadUrl: string
  s3Key: string
  expiresIn: number
}

export interface VideoCreateRequest {
  title: string
  s3Key: string
  language: string
  durationSeconds?: number
  contentType?: string
  primaryGoal?: string
  notes?: string
}

export interface VideoResponse {
  id: number
  title: string
  s3Key: string
  status: string
  createdAt: string
}

export interface JobSubmitRequest {
  slaHours: number
  extraReviewers?: number
  fasterDelivery?: boolean
  fullWatchSummary?: boolean
}

export interface JobResponse {
  id: number
  videoId: number
  status: string
  slaHours: number
  createdAt: string
}

export type UploadStage =
  | "idle"
  | "presigning"
  | "uploading"
  | "creating-video"
  | "submitting-job"
  | "complete"
  | "error"

export interface UploadState {
  stage: UploadStage
  progress: number
  error: string | null
  videoId: number | null
  jobId: number | null
}

// =============================================================================
// Upload Hook
// =============================================================================

export function useVideoUpload() {
  const [state, setState] = useState<UploadState>({
    stage: "idle",
    progress: 0,
    error: null,
    videoId: null,
    jobId: null,
  })

  // Store XHR reference for abort capability
  const xhrRef = useRef<XMLHttpRequest | null>(null)
  const abortedRef = useRef(false)

  const reset = useCallback(() => {
    // Abort any in-progress upload
    if (xhrRef.current) {
      xhrRef.current.abort()
      xhrRef.current = null
    }
    abortedRef.current = false
    setState({
      stage: "idle",
      progress: 0,
      error: null,
      videoId: null,
      jobId: null,
    })
  }, [])

  /**
   * Abort the current upload
   */
  const abort = useCallback(() => {
    abortedRef.current = true
    if (xhrRef.current) {
      xhrRef.current.abort()
      xhrRef.current = null
    }
    setState(prev => ({
      ...prev,
      stage: "error",
      error: "Upload cancelled"
    }))
  }, [])

  /**
   * Full upload pipeline - orchestrates all steps
   */
  const uploadVideo = useCallback(async (
    file: File,
    metadata: {
      title: string
      language: string
      durationSeconds?: number
      contentType?: string
      primaryGoal?: string
      notes?: string
    },
    jobOptions: {
      slaHours: number
      extraReviewers?: number
      fasterDelivery?: boolean
      fullWatchSummary?: boolean
    },
    onProgress?: (progress: number) => void
  ): Promise<{ videoId: number; jobId: number }> => {
    // Reset abort flag
    abortedRef.current = false

    /**
     * Step 1: Get presigned URL from backend
     */
    const getPresignedUrl = async (fileName: string, contentType: string): Promise<PresignResponse> => {
      if (abortedRef.current) throw new Error("Upload cancelled")

      setState(prev => ({ ...prev, stage: "presigning", progress: 5, error: null }))

      const response = await api<PresignResponse>("/storage/presign", {
        method: "POST",
        body: JSON.stringify({
          type: "VIDEO",
          fileName,
          contentType,
        }),
      })

      setState(prev => ({ ...prev, progress: 10 }))
      return response
    }

    /**
     * Step 2: Upload file directly to S3 using presigned URL
     */
    const uploadToS3 = async (
      fileToUpload: File,
      uploadUrl: string,
      progressCallback?: (progress: number) => void
    ): Promise<void> => {
      if (abortedRef.current) throw new Error("Upload cancelled")

      setState(prev => ({ ...prev, stage: "uploading", progress: 10 }))

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhrRef.current = xhr

        // Set timeout for large uploads (10 minutes)
        xhr.timeout = 600000

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            // Map S3 upload progress from 10% to 70%
            const s3Progress = (event.loaded / event.total) * 60 + 10
            setState(prev => ({ ...prev, progress: Math.round(s3Progress) }))
            progressCallback?.(s3Progress)
          }
        })

        xhr.addEventListener("load", () => {
          xhrRef.current = null
          if (xhr.status >= 200 && xhr.status < 300) {
            setState(prev => ({ ...prev, progress: 70 }))
            resolve()
          } else {
            reject(new Error(`S3 upload failed with status ${xhr.status}`))
          }
        })

        xhr.addEventListener("error", () => {
          xhrRef.current = null
          reject(new Error("S3 upload failed - network error"))
        })

        xhr.addEventListener("abort", () => {
          xhrRef.current = null
          reject(new Error("Upload cancelled"))
        })

        xhr.addEventListener("timeout", () => {
          xhrRef.current = null
          reject(new Error("S3 upload timed out - please try again"))
        })

        xhr.open("PUT", uploadUrl)
        xhr.setRequestHeader("Content-Type", fileToUpload.type)
        xhr.send(fileToUpload)
      })
    }

    /**
     * Step 3: Create video record in backend
     */
    const createVideo = async (data: VideoCreateRequest): Promise<VideoResponse> => {
      if (abortedRef.current) throw new Error("Upload cancelled")

      setState(prev => ({ ...prev, stage: "creating-video", progress: 75 }))

      const response = await api<VideoResponse>("/creator/videos", {
        method: "POST",
        body: JSON.stringify(data),
      })

      setState(prev => ({ ...prev, progress: 85, videoId: response.id }))
      return response
    }

    /**
     * Step 4: Submit job for processing
     */
    const submitJob = async (videoId: number, data: JobSubmitRequest): Promise<JobResponse> => {
      if (abortedRef.current) throw new Error("Upload cancelled")

      setState(prev => ({ ...prev, stage: "submitting-job", progress: 90 }))

      const response = await api<JobResponse>(`/creator/videos/${videoId}/submit`, {
        method: "POST",
        body: JSON.stringify(data),
      })

      setState(prev => ({
        ...prev,
        stage: "complete",
        progress: 100,
        jobId: response.id
      }))
      return response
    }

    // Main upload flow
    try {
      // Reset state
      setState({
        stage: "idle",
        progress: 0,
        error: null,
        videoId: null,
        jobId: null,
      })

      // Step 1: Get presigned URL
      const presign = await getPresignedUrl(file.name, file.type)

      // Step 2: Upload to S3
      await uploadToS3(file, presign.uploadUrl, onProgress)

      // Step 3: Create video record
      const video = await createVideo({
        title: metadata.title,
        s3Key: presign.s3Key,
        language: metadata.language,
        durationSeconds: metadata.durationSeconds,
        contentType: metadata.contentType,
        primaryGoal: metadata.primaryGoal,
        notes: metadata.notes,
      })

      // Step 4: Submit job
      const job = await submitJob(video.id, {
        slaHours: jobOptions.slaHours,
        extraReviewers: jobOptions.extraReviewers,
        fasterDelivery: jobOptions.fasterDelivery,
        fullWatchSummary: jobOptions.fullWatchSummary,
      })

      return { videoId: video.id, jobId: job.id }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed"
      setState(prev => ({
        ...prev,
        stage: "error",
        error: errorMessage
      }))
      throw error
    }
  }, [])

  /**
   * Retry upload from the beginning
   */
  const retry = useCallback(async (
    file: File,
    metadata: {
      title: string
      language: string
      durationSeconds?: number
      contentType?: string
      primaryGoal?: string
      notes?: string
    },
    jobOptions: {
      slaHours: number
      extraReviewers?: number
      fasterDelivery?: boolean
      fullWatchSummary?: boolean
    }
  ) => {
    reset()
    return uploadVideo(file, metadata, jobOptions)
  }, [reset, uploadVideo])

  return {
    state,
    uploadVideo,
    retry,
    reset,
    abort,
  }
}
