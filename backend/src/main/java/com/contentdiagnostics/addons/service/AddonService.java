package com.contentdiagnostics.addons.service;

import com.contentdiagnostics.addons.dto.*;
import com.contentdiagnostics.addons.entity.Addon;
import com.contentdiagnostics.addons.entity.AppliedAddon;
import com.contentdiagnostics.addons.repository.AddonRepository;
import com.contentdiagnostics.addons.repository.AppliedAddonRepository;
import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.common.exception.BadRequestException;
import com.contentdiagnostics.common.exception.ConflictException;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.jobs.entity.Job;
import com.contentdiagnostics.jobs.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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

    // ===== Admin Methods =====

    /**
     * Get all addons (admin view) including inactive ones.
     */
    @Transactional(readOnly = true)
    public List<AdminAddonDto> getAllAddons() {
        return addonRepository.findAll().stream()
                .map(addon -> AdminAddonDto.fromEntity(addon, appliedAddonRepository.countByAddon(addon)))
                .collect(Collectors.toList());
    }

    /**
     * Get addon by ID (admin).
     */
    @Transactional(readOnly = true)
    public AdminAddonDto getAddon(Long id) {
        Addon addon = addonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Addon", id.toString()));
        return AdminAddonDto.fromEntity(addon, appliedAddonRepository.countByAddon(addon));
    }

    /**
     * Create a new addon.
     */
    @Transactional
    public AdminAddonDto createAddon(CreateAddonRequest request) {
        // Check for duplicate code
        if (addonRepository.findByCode(request.getCode()).isPresent()) {
            throw new ConflictException("Addon with code '" + request.getCode() + "' already exists");
        }

        Addon addon = Addon.builder()
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .priceDisplay("$" + request.getPrice().stripTrailingZeros().toPlainString())
                .category(request.getCategory())
                .active(request.getActive())
                .build();

        addon = addonRepository.save(addon);
        log.info("Created addon: {} ({})", addon.getName(), addon.getCode());

        return AdminAddonDto.fromEntity(addon, 0L);
    }

    /**
     * Update an existing addon.
     */
    @Transactional
    public AdminAddonDto updateAddon(Long id, UpdateAddonRequest request) {
        Addon addon = addonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Addon", id.toString()));

        if (request.getName() != null) {
            addon.setName(request.getName());
        }
        if (request.getDescription() != null) {
            addon.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            addon.setPrice(request.getPrice());
            addon.setPriceDisplay("$" + request.getPrice().stripTrailingZeros().toPlainString());
        }
        if (request.getCategory() != null) {
            addon.setCategory(request.getCategory());
        }
        if (request.getActive() != null) {
            addon.setActive(request.getActive());
        }

        addon = addonRepository.save(addon);
        log.info("Updated addon: {} ({})", addon.getName(), addon.getCode());

        return AdminAddonDto.fromEntity(addon, appliedAddonRepository.countByAddon(addon));
    }

    /**
     * Activate or deactivate an addon.
     */
    @Transactional
    public AdminAddonDto setAddonActive(Long id, boolean active) {
        Addon addon = addonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Addon", id.toString()));

        addon.setActive(active);
        addon = addonRepository.save(addon);
        log.info("{} addon: {} ({})", active ? "Activated" : "Deactivated", addon.getName(), addon.getCode());

        return AdminAddonDto.fromEntity(addon, appliedAddonRepository.countByAddon(addon));
    }

    /**
     * Get all applied addons (admin view) with pagination.
     */
    @Transactional(readOnly = true)
    public Page<AdminAppliedAddonDto> getAppliedAddons(int page, int size) {
        return appliedAddonRepository.findAllByOrderByAppliedAtDesc(PageRequest.of(page, size))
                .map(AdminAppliedAddonDto::fromEntity);
    }

    /**
     * Get addon usage statistics.
     */
    @Transactional(readOnly = true)
    public AddonStatsDto getAddonStats() {
        long totalActive = appliedAddonRepository.countByStatus(AppliedAddon.AppliedAddonStatus.ACTIVE);
        long totalCompleted = appliedAddonRepository.countByStatus(AppliedAddon.AppliedAddonStatus.COMPLETED);
        long totalRefunded = appliedAddonRepository.countByStatus(AppliedAddon.AppliedAddonStatus.REFUNDED);
        long catalogCount = addonRepository.count();
        long activeCatalogCount = addonRepository.countByActiveTrue();

        return AddonStatsDto.builder()
                .catalogCount(catalogCount)
                .activeCatalogCount(activeCatalogCount)
                .totalApplied(totalActive + totalCompleted + totalRefunded)
                .activeApplied(totalActive)
                .completedApplied(totalCompleted)
                .refundedApplied(totalRefunded)
                .build();
    }
}
