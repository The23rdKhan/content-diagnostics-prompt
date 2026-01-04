package com.contentdiagnostics.notifications.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for sending emails via Resend API.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    private final RestTemplate restTemplate;

    @Value("${resend.api-key:}")
    private String resendApiKey;

    @Value("${resend.from-email:noreply@contentdiagnostics.com}")
    private String fromEmail;

    @Value("${resend.from-name:Content Diagnostics}")
    private String fromName;

    /**
     * Check if email service is configured.
     */
    public boolean isConfigured() {
        return resendApiKey != null && !resendApiKey.isBlank() && !resendApiKey.contains("placeholder");
    }

    /**
     * Send an email.
     *
     * @param toEmail   recipient email address
     * @param subject   email subject
     * @param htmlBody  HTML content of the email
     * @return true if sent successfully, false otherwise
     */
    public boolean sendEmail(String toEmail, String subject, String htmlBody) {
        if (!isConfigured()) {
            log.debug("Email service not configured, skipping email to {}", toEmail);
            return false;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("from", fromName + " <" + fromEmail + ">");
            body.put("to", List.of(toEmail));
            body.put("subject", subject);
            body.put("html", htmlBody);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(RESEND_API_URL, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Email sent successfully to {}: {}", toEmail, subject);
                return true;
            } else {
                log.warn("Failed to send email to {}: status={}", toEmail, response.getStatusCode());
                return false;
            }
        } catch (Exception e) {
            log.error("Error sending email to {}: {}", toEmail, e.getMessage());
            return false;
        }
    }

    /**
     * Send a notification email.
     */
    public boolean sendNotificationEmail(String toEmail, String title, String message, String deepLink) {
        String htmlBody = buildNotificationEmail(title, message, deepLink);
        return sendEmail(toEmail, title, htmlBody);
    }

    private String buildNotificationEmail(String title, String message, String deepLink) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html><head><meta charset='utf-8'></head>");
        html.append("<body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>");
        html.append("<div style='background: #f8f9fa; padding: 20px; border-radius: 8px;'>");
        html.append("<h2 style='color: #333; margin-top: 0;'>").append(escapeHtml(title)).append("</h2>");
        html.append("<p style='color: #666; line-height: 1.6;'>").append(escapeHtml(message)).append("</p>");

        if (deepLink != null && !deepLink.isBlank()) {
            html.append("<p style='margin-top: 20px;'>");
            html.append("<a href='").append(escapeHtml(deepLink)).append("' ");
            html.append("style='background: #007bff; color: white; padding: 10px 20px; ");
            html.append("text-decoration: none; border-radius: 4px; display: inline-block;'>");
            html.append("View Details</a></p>");
        }

        html.append("</div>");
        html.append("<p style='color: #999; font-size: 12px; margin-top: 20px;'>");
        html.append("You received this email from Content Diagnostics. ");
        html.append("You can manage your email preferences in your account settings.</p>");
        html.append("</body></html>");

        return html.toString();
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;");
    }
}
