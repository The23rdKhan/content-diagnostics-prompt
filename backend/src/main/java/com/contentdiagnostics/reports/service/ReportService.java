package com.contentdiagnostics.reports.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.reports.dto.ReportComparisonResponse;
import com.contentdiagnostics.reports.dto.ReportDto;
import com.contentdiagnostics.reports.entity.Report;
import com.contentdiagnostics.reports.entity.ReportStatus;
import com.contentdiagnostics.reports.repository.ReportRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for report operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final ObjectMapper objectMapper;

    /**
     * Get all reports for a creator.
     */
    @Transactional(readOnly = true)
    public List<ReportDto> getCreatorReports(User creator) {
        List<Report> reports = reportRepository.findByCreatorOrderByCreatedAtDesc(creator);
        return reports.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    /**
     * Get a specific report.
     */
    @Transactional(readOnly = true)
    public ReportDto getReport(User creator, Long reportId) {
        Report report = reportRepository.findByIdAndCreator(reportId, creator)
                .orElseThrow(() -> new ResourceNotFoundException("Report", reportId.toString()));
        return mapToDto(report);
    }

    /**
     * Compare two reports.
     */
    @Transactional(readOnly = true)
    public ReportComparisonResponse compareReports(User creator, Long leftId, Long rightId) {
        Report leftReport = reportRepository.findByIdAndCreator(leftId, creator)
                .orElseThrow(() -> new ResourceNotFoundException("Report", leftId.toString()));

        Report rightReport = reportRepository.findByIdAndCreator(rightId, creator)
                .orElseThrow(() -> new ResourceNotFoundException("Report", rightId.toString()));

        Integer clarityDelta = calculateDelta(rightReport.getClarityScore(), leftReport.getClarityScore());
        Integer pacingDelta = calculateDelta(rightReport.getPacingScore(), leftReport.getPacingScore());
        Integer engagementDelta = calculateDelta(rightReport.getEngagementScore(), leftReport.getEngagementScore());
        Integer structureDelta = calculateDelta(rightReport.getStructureScore(), leftReport.getStructureScore());

        String overallTrend = determineOverallTrend(clarityDelta, pacingDelta, engagementDelta, structureDelta);

        return ReportComparisonResponse.builder()
                .leftReport(mapToDto(leftReport))
                .rightReport(mapToDto(rightReport))
                .scoreComparison(ReportComparisonResponse.ScoreComparison.builder()
                        .clarityDelta(clarityDelta)
                        .pacingDelta(pacingDelta)
                        .engagementDelta(engagementDelta)
                        .structureDelta(structureDelta)
                        .overallTrend(overallTrend)
                        .build())
                .build();
    }

    // --- Helper methods ---

    private Integer calculateDelta(Integer newer, Integer older) {
        if (newer == null || older == null) return null;
        return newer - older;
    }

    private String determineOverallTrend(Integer... deltas) {
        int positive = 0;
        int negative = 0;

        for (Integer delta : deltas) {
            if (delta != null) {
                if (delta > 0) positive++;
                else if (delta < 0) negative++;
            }
        }

        if (positive > negative) return "improved";
        if (negative > positive) return "declined";
        return "stable";
    }

    private ReportDto mapToDto(Report report) {
        return ReportDto.builder()
                .id(report.getId())
                .videoTitle(report.getVideoTitle())
                .duration(report.getDuration())
                .videoDurationMinutes(report.getVideoDurationMinutes())
                .languagePool(report.getLanguagePool())
                .status(report.getStatus())
                .guaranteedReviewers(report.getGuaranteedReviewers())
                .slaWindow(report.getSlaWindow())
                .actualDeliveryTime(report.getActualDeliveryTime())
                .dateSubmitted(report.getDateSubmitted())
                .dateCompleted(report.getDateCompleted())
                .aiComplete(report.getStatus() != ReportStatus.COMPILING)
                .humanComplete(report.getStatus() == ReportStatus.DELIVERED
                        || report.getStatus() == ReportStatus.COMPILING)
                .compiled(report.getStatus() == ReportStatus.DELIVERED)
                .clarityScore(report.getClarityScore())
                .pacingScore(report.getPacingScore())
                .engagementScore(report.getEngagementScore())
                .structureScore(report.getStructureScore())
                .executiveSummary(report.getExecutiveSummary())
                .timelineInsights(parseJson(report.getTimelineInsightsJson(),
                        new TypeReference<List<ReportDto.TimelineInsight>>() {}))
                .aiAnalysis(parseJson(report.getAiAnalysisJson(),
                        new TypeReference<ReportDto.AiAnalysis>() {}))
                .humanReviews(parseJson(report.getHumanReviewsJson(),
                        new TypeReference<ReportDto.HumanReviews>() {}))
                .actionPlan(parseJson(report.getActionPlanJson(),
                        new TypeReference<List<ReportDto.ActionItem>>() {}))
                .seriesId(report.getSeriesId())
                .version(report.getVersion())
                .build();
    }

    private <T> T parseJson(String json, TypeReference<T> typeRef) {
        if (json == null) return null;
        try {
            return objectMapper.readValue(json, typeRef);
        } catch (JsonProcessingException e) {
            log.error("Error parsing JSON", e);
            return null;
        }
    }
}
