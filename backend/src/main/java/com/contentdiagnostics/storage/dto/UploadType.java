package com.contentdiagnostics.storage.dto;

/**
 * Types of uploads supported by the storage service.
 */
public enum UploadType {
    /**
     * Video content for review.
     */
    VIDEO,

    /**
     * Creator profile avatar image.
     */
    CREATOR_AVATAR,

    /**
     * Creator profile banner image.
     */
    CREATOR_BANNER,

    /**
     * Reviewer profile avatar image.
     */
    REVIEWER_AVATAR
}
