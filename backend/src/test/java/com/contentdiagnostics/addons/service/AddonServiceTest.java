package com.contentdiagnostics.addons.service;

import com.contentdiagnostics.addons.dto.*;
import com.contentdiagnostics.addons.entity.Addon;
import com.contentdiagnostics.addons.entity.AppliedAddon;
import com.contentdiagnostics.addons.repository.AddonRepository;
import com.contentdiagnostics.addons.repository.AppliedAddonRepository;
import com.contentdiagnostics.common.exception.ConflictException;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.jobs.repository.JobRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AddonService")
class AddonServiceTest {

    @Mock
    private AddonRepository addonRepository;

    @Mock
    private AppliedAddonRepository appliedAddonRepository;

    @Mock
    private JobRepository jobRepository;

    @InjectMocks
    private AddonService addonService;

    private Addon testAddon;

    @BeforeEach
    void setUp() {
        testAddon = Addon.builder()
                .id(1L)
                .code("extra_reviewers")
                .name("Extra Reviewers")
                .description("Add more reviewers to your video")
                .price(new BigDecimal("9.99"))
                .priceDisplay("$9.99")
                .category(Addon.AddonCategory.REVIEWERS)
                .active(true)
                .build();
    }

    @Nested
    @DisplayName("createAddon")
    class CreateAddon {

        private CreateAddonRequest validRequest;

        @BeforeEach
        void setUp() {
            validRequest = CreateAddonRequest.builder()
                    .code("rush_delivery")
                    .name("Rush Delivery")
                    .description("Get results faster")
                    .price(new BigDecimal("19.99"))
                    .category(Addon.AddonCategory.DELIVERY)
                    .active(true)
                    .build();
        }

        @Test
        @DisplayName("should create addon with all fields")
        void shouldCreateAddonWithAllFields() {
            when(addonRepository.findByCode(validRequest.getCode())).thenReturn(Optional.empty());
            when(addonRepository.save(any(Addon.class))).thenAnswer(i -> {
                Addon a = i.getArgument(0);
                a.setId(2L);
                return a;
            });

            AdminAddonDto result = addonService.createAddon(validRequest);

            assertThat(result).isNotNull();
            assertThat(result.getCode()).isEqualTo("rush_delivery");
            assertThat(result.getName()).isEqualTo("Rush Delivery");
            assertThat(result.getPrice()).isEqualTo(new BigDecimal("19.99"));
            assertThat(result.getAppliedCount()).isEqualTo(0L);

            ArgumentCaptor<Addon> captor = ArgumentCaptor.forClass(Addon.class);
            verify(addonRepository).save(captor.capture());
            assertThat(captor.getValue().getPriceDisplay()).isEqualTo("$19.99");
        }

        @Test
        @DisplayName("should throw when code already exists")
        void shouldThrowWhenCodeExists() {
            when(addonRepository.findByCode(validRequest.getCode())).thenReturn(Optional.of(testAddon));

            assertThatThrownBy(() -> addonService.createAddon(validRequest))
                    .isInstanceOf(ConflictException.class)
                    .hasMessageContaining("already exists");
        }
    }

    @Nested
    @DisplayName("updateAddon")
    class UpdateAddon {

        @Test
        @DisplayName("should update addon fields")
        void shouldUpdateAddonFields() {
            UpdateAddonRequest request = UpdateAddonRequest.builder()
                    .name("Updated Name")
                    .price(new BigDecimal("14.99"))
                    .build();

            when(addonRepository.findById(1L)).thenReturn(Optional.of(testAddon));
            when(addonRepository.save(any(Addon.class))).thenAnswer(i -> i.getArgument(0));
            when(appliedAddonRepository.countByAddon(testAddon)).thenReturn(5L);

            AdminAddonDto result = addonService.updateAddon(1L, request);

            assertThat(result.getName()).isEqualTo("Updated Name");
            assertThat(result.getPrice()).isEqualTo(new BigDecimal("14.99"));
            assertThat(result.getAppliedCount()).isEqualTo(5L);
        }

        @Test
        @DisplayName("should update only provided fields")
        void shouldUpdateOnlyProvidedFields() {
            UpdateAddonRequest request = UpdateAddonRequest.builder()
                    .description("New description only")
                    .build();

            when(addonRepository.findById(1L)).thenReturn(Optional.of(testAddon));
            when(addonRepository.save(any(Addon.class))).thenAnswer(i -> i.getArgument(0));
            when(appliedAddonRepository.countByAddon(testAddon)).thenReturn(0L);

            AdminAddonDto result = addonService.updateAddon(1L, request);

            assertThat(result.getName()).isEqualTo("Extra Reviewers"); // Unchanged
            assertThat(result.getDescription()).isEqualTo("New description only");
        }

        @Test
        @DisplayName("should throw when addon not found")
        void shouldThrowWhenNotFound() {
            when(addonRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> addonService.updateAddon(99L, new UpdateAddonRequest()))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("setAddonActive")
    class SetAddonActive {

        @Test
        @DisplayName("should deactivate addon")
        void shouldDeactivateAddon() {
            when(addonRepository.findById(1L)).thenReturn(Optional.of(testAddon));
            when(addonRepository.save(any(Addon.class))).thenAnswer(i -> i.getArgument(0));
            when(appliedAddonRepository.countByAddon(testAddon)).thenReturn(10L);

            AdminAddonDto result = addonService.setAddonActive(1L, false);

            assertThat(result.getActive()).isFalse();
            assertThat(result.getAppliedCount()).isEqualTo(10L);
        }

        @Test
        @DisplayName("should activate addon")
        void shouldActivateAddon() {
            testAddon.setActive(false);
            when(addonRepository.findById(1L)).thenReturn(Optional.of(testAddon));
            when(addonRepository.save(any(Addon.class))).thenAnswer(i -> i.getArgument(0));
            when(appliedAddonRepository.countByAddon(testAddon)).thenReturn(0L);

            AdminAddonDto result = addonService.setAddonActive(1L, true);

            assertThat(result.getActive()).isTrue();
        }

        @Test
        @DisplayName("should throw when addon not found")
        void shouldThrowWhenNotFound() {
            when(addonRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> addonService.setAddonActive(99L, true))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("getAllAddons")
    class GetAllAddons {

        @Test
        @DisplayName("should return all addons with usage counts")
        void shouldReturnAllAddonsWithUsageCounts() {
            Addon addon2 = Addon.builder()
                    .id(2L)
                    .code("fast_delivery")
                    .name("Fast Delivery")
                    .price(new BigDecimal("4.99"))
                    .priceDisplay("$4.99")
                    .category(Addon.AddonCategory.DELIVERY)
                    .active(true)
                    .build();

            when(addonRepository.findAll()).thenReturn(List.of(testAddon, addon2));
            when(appliedAddonRepository.findAddonUsageCounts()).thenReturn(List.of(
                    new Object[]{1L, 15L},
                    new Object[]{2L, 8L}
            ));

            List<AdminAddonDto> result = addonService.getAllAddons();

            assertThat(result).hasSize(2);
            assertThat(result.get(0).getAppliedCount()).isEqualTo(15L);
            assertThat(result.get(1).getAppliedCount()).isEqualTo(8L);
        }

        @Test
        @DisplayName("should return zero count for addons with no usage")
        void shouldReturnZeroCountForUnusedAddons() {
            when(addonRepository.findAll()).thenReturn(List.of(testAddon));
            when(appliedAddonRepository.findAddonUsageCounts()).thenReturn(Collections.emptyList());

            List<AdminAddonDto> result = addonService.getAllAddons();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getAppliedCount()).isEqualTo(0L);
        }

        @Test
        @DisplayName("should handle empty addon list")
        void shouldHandleEmptyAddonList() {
            when(addonRepository.findAll()).thenReturn(Collections.emptyList());
            when(appliedAddonRepository.findAddonUsageCounts()).thenReturn(Collections.emptyList());

            List<AdminAddonDto> result = addonService.getAllAddons();

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("getAddonStats")
    class GetAddonStats {

        @Test
        @DisplayName("should return correct statistics")
        void shouldReturnCorrectStatistics() {
            when(appliedAddonRepository.countByStatus(AppliedAddon.AppliedAddonStatus.ACTIVE)).thenReturn(25L);
            when(appliedAddonRepository.countByStatus(AppliedAddon.AppliedAddonStatus.COMPLETED)).thenReturn(100L);
            when(appliedAddonRepository.countByStatus(AppliedAddon.AppliedAddonStatus.REFUNDED)).thenReturn(5L);
            when(addonRepository.count()).thenReturn(10L);
            when(addonRepository.countByActiveTrue()).thenReturn(8L);

            AddonStatsDto result = addonService.getAddonStats();

            assertThat(result.getCatalogCount()).isEqualTo(10L);
            assertThat(result.getActiveCatalogCount()).isEqualTo(8L);
            assertThat(result.getTotalApplied()).isEqualTo(130L);
            assertThat(result.getActiveApplied()).isEqualTo(25L);
            assertThat(result.getCompletedApplied()).isEqualTo(100L);
            assertThat(result.getRefundedApplied()).isEqualTo(5L);
        }

        @Test
        @DisplayName("should handle zero counts")
        void shouldHandleZeroCounts() {
            when(appliedAddonRepository.countByStatus(any())).thenReturn(0L);
            when(addonRepository.count()).thenReturn(0L);
            when(addonRepository.countByActiveTrue()).thenReturn(0L);

            AddonStatsDto result = addonService.getAddonStats();

            assertThat(result.getCatalogCount()).isEqualTo(0L);
            assertThat(result.getTotalApplied()).isEqualTo(0L);
        }
    }

    @Nested
    @DisplayName("getAddon")
    class GetAddon {

        @Test
        @DisplayName("should return addon by ID")
        void shouldReturnAddonById() {
            when(addonRepository.findById(1L)).thenReturn(Optional.of(testAddon));
            when(appliedAddonRepository.countByAddon(testAddon)).thenReturn(42L);

            AdminAddonDto result = addonService.getAddon(1L);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getCode()).isEqualTo("extra_reviewers");
            assertThat(result.getAppliedCount()).isEqualTo(42L);
        }

        @Test
        @DisplayName("should throw when addon not found")
        void shouldThrowWhenNotFound() {
            when(addonRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> addonService.getAddon(99L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
