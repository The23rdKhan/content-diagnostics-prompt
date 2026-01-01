package com.contentdiagnostics.videos.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.videos.dto.CreateVideoRequest;
import com.contentdiagnostics.videos.dto.VideoDto;
import com.contentdiagnostics.videos.entity.Video;
import com.contentdiagnostics.videos.entity.VideoStatus;
import com.contentdiagnostics.videos.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for video operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VideoService {

    private final VideoRepository videoRepository;

    /**
     * Create a new video record.
     */
    @Transactional
    public VideoDto createVideo(User creator, CreateVideoRequest request) {
        Video video = Video.builder()
                .creator(creator)
                .title(request.getTitle())
                .fileName(request.getFileName())
                .fileSize(request.getFileSize())
                .storageKey(request.getStorageKey())
                .storageUrl(request.getStorageUrl())
                .status(VideoStatus.UPLOADING)
                .language(request.getLanguage() != null ? request.getLanguage() : "English")
                .build();

        video = videoRepository.save(video);

        log.info("Video {} created for creator {}", video.getId(), creator.getId());

        return mapToDto(video);
    }

    /**
     * Get all videos for a creator.
     */
    @Transactional(readOnly = true)
    public List<VideoDto> getCreatorVideos(User creator) {
        List<Video> videos = videoRepository.findByCreatorOrderByCreatedAtDesc(creator);
        return videos.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    /**
     * Get a specific video for a creator.
     */
    @Transactional(readOnly = true)
    public VideoDto getVideo(User creator, Long videoId) {
        Video video = videoRepository.findByIdAndCreator(videoId, creator)
                .orElseThrow(() -> new ResourceNotFoundException("Video", videoId.toString()));
        return mapToDto(video);
    }

    /**
     * Mark video upload as complete.
     */
    @Transactional
    public VideoDto markUploadComplete(User creator, Long videoId) {
        Video video = videoRepository.findByIdAndCreator(videoId, creator)
                .orElseThrow(() -> new ResourceNotFoundException("Video", videoId.toString()));

        video.setStatus(VideoStatus.UPLOADED);
        video = videoRepository.save(video);

        log.info("Video {} marked as uploaded", videoId);

        // TODO: Trigger video processing via SQS

        return mapToDto(video);
    }

    // --- Helper methods ---

    private VideoDto mapToDto(Video video) {
        return VideoDto.builder()
                .id(video.getId())
                .title(video.getTitle())
                .fileName(video.getFileName())
                .fileSize(video.getFileSize())
                .storageUrl(video.getStorageUrl())
                .status(video.getStatus())
                .language(video.getLanguage())
                .durationSeconds(video.getDurationSeconds())
                .resolution(video.getResolution())
                .createdAt(video.getCreatedAt())
                .build();
    }
}
