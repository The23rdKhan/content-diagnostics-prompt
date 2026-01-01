package com.contentdiagnostics.videos.entity;

import com.contentdiagnostics.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

/**
 * Entity representing an uploaded video.
 */
@Entity
@Table(name = "videos", indexes = {
        @Index(name = "idx_videos_creator_id", columnList = "creator_id"),
        @Index(name = "idx_videos_status", columnList = "status")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Video {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 255)
    private String fileName;

    @Column(nullable = false)
    private Long fileSize; // bytes

    @Column(nullable = false, length = 512)
    private String storageKey;

    @Column(length = 512)
    private String storageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private VideoStatus status = VideoStatus.UPLOADING;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String language = "English";

    @Column
    private Integer durationSeconds;

    @Column(length = 100)
    private String resolution;

    @Column(length = 50)
    private String codec;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;
}
