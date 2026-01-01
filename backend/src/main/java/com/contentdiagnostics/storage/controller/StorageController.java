package com.contentdiagnostics.storage.controller;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.common.dto.ApiResponse;
import com.contentdiagnostics.common.util.SecurityUtils;
import com.contentdiagnostics.storage.dto.PresignRequest;
import com.contentdiagnostics.storage.dto.PresignResponse;
import com.contentdiagnostics.storage.service.StorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for storage operations.
 */
@Slf4j
@RestController
@RequestMapping("/storage")
@RequiredArgsConstructor
public class StorageController {

    private final StorageService storageService;

    /**
     * Generate a presigned URL for uploading.
     * POST /api/storage/presign
     */
    @PostMapping("/presign")
    public ResponseEntity<ApiResponse<PresignResponse>> generatePresignedUrl(
            @Valid @RequestBody PresignRequest request) {

        User user = SecurityUtils.getCurrentUser();
        PresignResponse response = storageService.generatePresignedUrl(user, request);

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
