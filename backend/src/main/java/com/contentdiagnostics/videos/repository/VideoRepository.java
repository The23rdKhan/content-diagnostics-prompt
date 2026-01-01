package com.contentdiagnostics.videos.repository;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.videos.entity.Video;
import com.contentdiagnostics.videos.entity.VideoStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Video entities.
 */
@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {

    /**
     * Find all videos by creator.
     */
    Page<Video> findByCreator(User creator, Pageable pageable);

    /**
     * Find all videos by creator ordered by creation date.
     */
    List<Video> findByCreatorOrderByCreatedAtDesc(User creator);

    /**
     * Find video by ID and creator (for authorization).
     */
    Optional<Video> findByIdAndCreator(Long id, User creator);

    /**
     * Find videos by status.
     */
    List<Video> findByStatus(VideoStatus status);

    /**
     * Update video status.
     */
    @Modifying
    @Query("UPDATE Video v SET v.status = :status WHERE v.id = :videoId")
    int updateStatus(@Param("videoId") Long videoId, @Param("status") VideoStatus status);

    /**
     * Update video metadata after processing.
     */
    @Modifying
    @Query("UPDATE Video v SET v.status = :status, v.durationSeconds = :duration, " +
            "v.resolution = :resolution, v.codec = :codec WHERE v.id = :videoId")
    int updateAfterProcessing(@Param("videoId") Long videoId,
                              @Param("status") VideoStatus status,
                              @Param("duration") Integer duration,
                              @Param("resolution") String resolution,
                              @Param("codec") String codec);

    /**
     * Count videos by creator.
     */
    long countByCreator(User creator);
}
