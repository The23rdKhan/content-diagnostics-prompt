package com.contentdiagnostics.videos.entity;

/**
 * Status of a video in the processing pipeline.
 */
public enum VideoStatus {
    /**
     * Video is being uploaded.
     */
    UPLOADING,

    /**
     * Upload complete, awaiting processing.
     */
    UPLOADED,

    /**
     * Video is being processed (transcoding, metadata extraction).
     */
    PROCESSING,

    /**
     * Processing complete, ready for review job creation.
     */
    READY,

    /**
     * Processing failed.
     */
    FAILED
}
