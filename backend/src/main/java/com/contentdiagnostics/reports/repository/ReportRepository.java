package com.contentdiagnostics.reports.repository;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.jobs.entity.Job;
import com.contentdiagnostics.reports.entity.Report;
import com.contentdiagnostics.reports.entity.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Report entities.
 */
@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    /**
     * Find all reports by creator.
     */
    Page<Report> findByCreator(User creator, Pageable pageable);

    /**
     * Find all reports by creator ordered by date.
     */
    List<Report> findByCreatorOrderByCreatedAtDesc(User creator);

    /**
     * Find report by ID and creator.
     */
    Optional<Report> findByIdAndCreator(Long id, User creator);

    /**
     * Find report by job.
     */
    Optional<Report> findByJob(Job job);

    /**
     * Find reports by series ID.
     */
    List<Report> findBySeriesIdOrderByVersionAsc(String seriesId);

    /**
     * Find delivered reports by creator.
     */
    List<Report> findByCreatorAndStatusOrderByCreatedAtDesc(User creator, ReportStatus status);

    /**
     * Count reports by creator.
     */
    long countByCreator(User creator);

    /**
     * Count delivered reports by creator.
     */
    long countByCreatorAndStatus(User creator, ReportStatus status);
}
