package com.contentdiagnostics.common.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Service for encrypting and decrypting sensitive data.
 * Uses AES-256-GCM for authenticated encryption.
 */
@Slf4j
@Service
public class EncryptionService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 128;
    private static final int GCM_IV_LENGTH = 12;

    @Value("${app.encryption.key:}")
    private String encryptionKey;

    private boolean configured = false;
    private SecretKey secretKey;

    /**
     * Check if encryption is properly configured.
     */
    public boolean isConfigured() {
        if (!configured && encryptionKey != null && !encryptionKey.isEmpty()) {
            try {
                byte[] keyBytes = Base64.getDecoder().decode(encryptionKey);
                if (keyBytes.length == 32) { // 256 bits
                    secretKey = new SecretKeySpec(keyBytes, "AES");
                    configured = true;
                } else {
                    log.warn("Encryption key must be 32 bytes (256 bits) base64 encoded. Got {} bytes.", keyBytes.length);
                }
            } catch (Exception e) {
                log.warn("Invalid encryption key configuration: {}", e.getMessage());
            }
        }
        return configured;
    }

    /**
     * Encrypt a plaintext string.
     * Returns the ciphertext with IV prepended, base64 encoded.
     * Returns the original string if encryption is not configured.
     */
    public String encrypt(String plaintext) {
        if (plaintext == null || plaintext.isEmpty()) {
            return plaintext;
        }

        if (!isConfigured()) {
            log.debug("Encryption not configured, storing plaintext");
            return plaintext;
        }

        try {
            // Generate random IV
            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);

            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            // Prepend IV to ciphertext
            byte[] combined = new byte[GCM_IV_LENGTH + ciphertext.length];
            System.arraycopy(iv, 0, combined, 0, GCM_IV_LENGTH);
            System.arraycopy(ciphertext, 0, combined, GCM_IV_LENGTH, ciphertext.length);

            return "ENC:" + Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            log.error("Encryption failed", e);
            throw new RuntimeException("Encryption failed", e);
        }
    }

    /**
     * Decrypt a ciphertext string.
     * Expects the IV prepended to the ciphertext, base64 encoded with "ENC:" prefix.
     * Returns the original string if it doesn't appear to be encrypted.
     */
    public String decrypt(String ciphertext) {
        if (ciphertext == null || ciphertext.isEmpty()) {
            return ciphertext;
        }

        // Check if this is actually encrypted (has our prefix)
        if (!ciphertext.startsWith("ENC:")) {
            // Not encrypted, return as-is (legacy data)
            return ciphertext;
        }

        if (!isConfigured()) {
            log.warn("Cannot decrypt - encryption not configured");
            return ciphertext;
        }

        try {
            byte[] combined = Base64.getDecoder().decode(ciphertext.substring(4));

            // Extract IV and ciphertext
            byte[] iv = new byte[GCM_IV_LENGTH];
            byte[] encryptedData = new byte[combined.length - GCM_IV_LENGTH];
            System.arraycopy(combined, 0, iv, 0, GCM_IV_LENGTH);
            System.arraycopy(combined, GCM_IV_LENGTH, encryptedData, 0, encryptedData.length);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);

            byte[] plaintext = cipher.doFinal(encryptedData);
            return new String(plaintext, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Decryption failed", e);
            throw new RuntimeException("Decryption failed", e);
        }
    }
}
