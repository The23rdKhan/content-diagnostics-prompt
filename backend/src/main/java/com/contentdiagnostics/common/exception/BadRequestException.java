package com.contentdiagnostics.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown for invalid request data or business rule violations.
 */
public class BadRequestException extends ApiException {

    public BadRequestException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "BAD_REQUEST");
    }

    public BadRequestException(String message, String errorCode) {
        super(message, HttpStatus.BAD_REQUEST, errorCode);
    }

    public BadRequestException(String message, String errorCode, Object details) {
        super(message, HttpStatus.BAD_REQUEST, errorCode, details);
    }
}
