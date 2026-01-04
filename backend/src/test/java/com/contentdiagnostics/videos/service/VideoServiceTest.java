package com.contentdiagnostics.videos.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.auth.entity.UserRole;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.videos.dto.CreateVideoRequest;
import com.contentdiagnostics.videos.dto.VideoDto;
import com.contentdiagnostics.videos.entity.Video;
import com.contentdiagnostics.videos.entity.VideoStatus;
import com.contentdiagnostics.videos.repository.VideoRepository;
import com.contentdiagnostics.workers.publisher.SqsPublisher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("VideoService")
class VideoServiceTest {

    @Mock
    private VideoRepository videoRepository;

    @Mock
    private SqsPublisher sqsPublisher;

    @InjectMocks
    private VideoService videoService;

    private User testCreator;
    private Video testVideo;

    @BeforeEach
    void setUp() {
        testCreator = new User();
        testCreator.setId(1L);
        testCreator.setEmail("creator@example.com");
        testCreator.setRole(UserRole.CREATOR);

        testVideo = Video.builder()
                .id(100L)
                .creator(testCreator)
                .title("Test Video")
                .fileName("test.mp4")
                .fileSize(10485760L)
                .storageKey("videos/test.mp4")
                .storageUrl("https://storage.example.com/videos/test.mp4")
                .status(VideoStatus.UPLOADING)
                .language("English")
                .createdAt(Instant.now())
                .build();
    }

    @Nested
    @DisplayName("createVideo")
    class CreateVideo {

        private CreateVideoRequest validRequest;

        @BeforeEach
        void setUp() {
            validRequest = new CreateVideoRequest();
            validRequest.setTitle("My New Video");
            validRequest.setFileName("new-video.mp4");
            validRequest.setFileSize(5242880L);
            validRequest.setStorageKey("videos/new-video.mp4");
            validRequest.setStorageUrl("https://storage.example.com/videos/new-video.mp4");
            validRequest.setLanguage("English");
        }

        @Test
        @DisplayName("should create video with UPLOADING status")
        void shouldCreateVideoWithUploadingStatus() {
            when(videoRepository.save(any(Video.class))).thenAnswer(i -> {
                Video v = i.getArgument(0);
                v.setId(100L);
                v.setCreatedAt(Instant.now());
                return v;
            });

            VideoDto result = videoService.createVideo(testCreator, validRequest);

            assertThat(result).isNotNull();
            assertThat(result.getStatus()).isEqualTo(VideoStatus.UPLOADING);
            assertThat(result.getTitle()).isEqualTo("My New Video");

            ArgumentCaptor<Video> videoCaptor = ArgumentCaptor.forClass(Video.class);
            verify(videoRepository).save(videoCaptor.capture());
            assertThat(videoCaptor.getValue().getStatus()).isEqualTo(VideoStatus.UPLOADING);
            assertThat(videoCaptor.getValue().getCreator()).isEqualTo(testCreator);
        }

        @Test
        @DisplayName("should default language to English when not provided")
        void shouldDefaultLanguageToEnglish() {
            validRequest.setLanguage(null);
            when(videoRepository.save(any(Video.class))).thenAnswer(i -> {
                Video v = i.getArgument(0);
                v.setId(100L);
                v.setCreatedAt(Instant.now());
                return v;
            });

            VideoDto result = videoService.createVideo(testCreator, validRequest);

            assertThat(result.getLanguage()).isEqualTo("English");
        }

        @Test
        @DisplayName("should preserve custom language when provided")
        void shouldPreserveCustomLanguage() {
            validRequest.setLanguage("Spanish");
            when(videoRepository.save(any(Video.class))).thenAnswer(i -> {
                Video v = i.getArgument(0);
                v.setId(100L);
                v.setCreatedAt(Instant.now());
                return v;
            });

            VideoDto result = videoService.createVideo(testCreator, validRequest);

            assertThat(result.getLanguage()).isEqualTo("Spanish");
        }
    }

    @Nested
    @DisplayName("getCreatorVideos")
    class GetCreatorVideos {

        @Test
        @DisplayName("should return videos for creator")
        void shouldReturnVideosForCreator() {
            when(videoRepository.findByCreatorOrderByCreatedAtDesc(testCreator))
                    .thenReturn(List.of(testVideo));

            List<VideoDto> videos = videoService.getCreatorVideos(testCreator);

            assertThat(videos).hasSize(1);
            assertThat(videos.get(0).getId()).isEqualTo(testVideo.getId());
            assertThat(videos.get(0).getTitle()).isEqualTo("Test Video");
        }

        @Test
        @DisplayName("should return empty list for new creator")
        void shouldReturnEmptyListForNewCreator() {
            when(videoRepository.findByCreatorOrderByCreatedAtDesc(testCreator))
                    .thenReturn(Collections.emptyList());

            List<VideoDto> videos = videoService.getCreatorVideos(testCreator);

            assertThat(videos).isEmpty();
        }
    }

    @Nested
    @DisplayName("getVideo")
    class GetVideo {

        @Test
        @DisplayName("should return video for owner")
        void shouldReturnVideoForOwner() {
            when(videoRepository.findByIdAndCreator(testVideo.getId(), testCreator))
                    .thenReturn(Optional.of(testVideo));

            VideoDto result = videoService.getVideo(testCreator, testVideo.getId());

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(testVideo.getId());
            assertThat(result.getTitle()).isEqualTo("Test Video");
        }

        @Test
        @DisplayName("should throw when video not found")
        void shouldThrowWhenNotFound() {
            when(videoRepository.findByIdAndCreator(99L, testCreator))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> videoService.getVideo(testCreator, 99L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Video");
        }
    }

    @Nested
    @DisplayName("markUploadComplete")
    class MarkUploadComplete {

        @Test
        @DisplayName("should update status to UPLOADED")
        void shouldUpdateStatusToUploaded() {
            when(videoRepository.findByIdAndCreator(testVideo.getId(), testCreator))
                    .thenReturn(Optional.of(testVideo));
            when(videoRepository.save(any(Video.class))).thenAnswer(i -> i.getArgument(0));

            VideoDto result = videoService.markUploadComplete(testCreator, testVideo.getId());

            assertThat(result.getStatus()).isEqualTo(VideoStatus.UPLOADED);
        }

        @Test
        @DisplayName("should publish SQS event")
        void shouldPublishSqsEvent() {
            when(videoRepository.findByIdAndCreator(testVideo.getId(), testCreator))
                    .thenReturn(Optional.of(testVideo));
            when(videoRepository.save(any(Video.class))).thenAnswer(i -> i.getArgument(0));

            videoService.markUploadComplete(testCreator, testVideo.getId());

            verify(sqsPublisher).publishVideoProcessingEvent(any(Video.class));
        }

        @Test
        @DisplayName("should throw when video not found")
        void shouldThrowWhenNotFound() {
            when(videoRepository.findByIdAndCreator(99L, testCreator))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> videoService.markUploadComplete(testCreator, 99L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Video");

            verify(sqsPublisher, never()).publishVideoProcessingEvent(any());
        }
    }
}
