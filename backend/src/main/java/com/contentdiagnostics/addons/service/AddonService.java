package com.contentdiagnostics.addons.service;

import com.contentdiagnostics.addons.dto.ActiveAddonDto;
import com.contentdiagnostics.addons.dto.AddonDto;
import com.contentdiagnostics.addons.dto.ApplyAddonRequest;
import com.contentdiagnostics.addons.entity.Addon;
import com.contentdiagnostics.addons.entity.AppliedAddon;
import com.contentdiagnostics.addons.repository.AddonRepository;
import com.contentdiagnostics.addons.repository.AppliedAddonRepository;
import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.common.exception.BadRequestException;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.jobs.entity.Job;
import com.contentdiagnostics.jobs.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AddonService {

    private final AddonRepository addonRepository;
    private final AppliedAddonRepository appliedAddonRepository;
    private final JobRepository jobRepository;

    /**
     * Get all available add-ons.
     */
    @Transactional(readOnly = true)
    public List<AddonDto> getAvailableAddons() {
        return addonRepository.findByActiveTrue().stream()
                .map(AddonDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get all active add-ons for a creator.
     */
    @Transactional(readOnly = true)
    public List<ActiveAddonDto> getActiveAddons(User creator) {
        return appliedAddonRepository.findByCreatorOrderByAppliedAtDesc(creator).stream()
                .map(ActiveAddonDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Apply an add-on to a job.
     */
    @Transactional
    public ActiveAddonDto applyAddon(User creator, Long jobId, ApplyAddonRequest request) {
        Job job = jobRepository.findByIdAndCreator(jobId, creator)
                .orElseThrow(() -> new ResourceNotFoundException("Job", jobId.toString()));

        Addon addon = addonRepository.findByCode(request.getAddonId())
                .orElseThrow(() -> new ResourceNotFoundException("Addon", request.getAddonId()));

        if (!addon.getActive()) {
            throw new BadRequestException("This add-on is no longer available", "ADDON_UNAVAILABLE");
        }

        AppliedAddon appliedAddon = AppliedAddon.builder()
                .addon(addon)
                .job(job)
                .creator(creator)
                .price(addon.getPrice())
                .quantity(request.getQuantity())
                .status(AppliedAddon.AppliedAddonStatus.ACTIVE)
                .build();

        appliedAddon = appliedAddonRepository.save(appliedAddon);
        log.info("Applied addon {} to job {} for creator {}", addon.getCode(), jobId, creator.getId());

        return ActiveAddonDto.fromEntity(appliedAddon);
    }
}
