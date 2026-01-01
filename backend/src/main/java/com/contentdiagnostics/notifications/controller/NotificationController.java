package com.contentdiagnostics.notifications.controller;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.common.dto.ApiResponse;
import com.contentdiagnostics.common.util.SecurityUtils;
import com.contentdiagnostics.notifications.dto.EmailPreferenceDto;
import com.contentdiagnostics.notifications.dto.MarkReadRequest;
import com.contentdiagnostics.notifications.dto.NotificationDto;
import com.contentdiagnostics.notifications.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for notification endpoints.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Get notifications for current user.
     * GET /api/notifications
     */
    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getNotifications() {
        User user = SecurityUtils.getCurrentUser();
        List<NotificationDto> notifications = notificationService.getNotifications(user);
        long unreadCount = notificationService.getUnreadCount(user);

        Map<String, Object> response = Map.of(
                "notifications", notifications,
                "unreadCount", unreadCount
        );

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Mark notifications as read.
     * POST /api/notifications/mark-read
     */
    @PostMapping("/notifications/mark-read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @Valid @RequestBody MarkReadRequest request) {

        User user = SecurityUtils.getCurrentUser();
        notificationService.markAsRead(user, request.getNotificationIds());

        return ResponseEntity.ok(ApiResponse.success("Notifications marked as read"));
    }

    /**
     * Mark all notifications as read.
     * POST /api/notifications/mark-all-read
     */
    @PostMapping("/notifications/mark-all-read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        User user = SecurityUtils.getCurrentUser();
        notificationService.markAllAsRead(user);

        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }

    /**
     * Get email preferences.
     * GET /api/settings/email-prefs
     */
    @GetMapping("/settings/email-prefs")
    public ResponseEntity<ApiResponse<EmailPreferenceDto>> getEmailPreferences() {
        User user = SecurityUtils.getCurrentUser();
        EmailPreferenceDto prefs = notificationService.getEmailPreferences(user);

        return ResponseEntity.ok(ApiResponse.success(prefs));
    }

    /**
     * Update email preferences.
     * PUT /api/settings/email-prefs
     */
    @PutMapping("/settings/email-prefs")
    public ResponseEntity<ApiResponse<EmailPreferenceDto>> updateEmailPreferences(
            @Valid @RequestBody EmailPreferenceDto request) {

        User user = SecurityUtils.getCurrentUser();
        EmailPreferenceDto prefs = notificationService.updateEmailPreferences(user, request);

        return ResponseEntity.ok(ApiResponse.success(prefs));
    }
}
