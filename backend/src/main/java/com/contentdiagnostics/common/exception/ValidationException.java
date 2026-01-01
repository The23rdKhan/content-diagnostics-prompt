package com.contentdiagnostics.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown for validation failures that should return 400 responses.
 */
public class ValidationException extends ApiException {

    public ValidationException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
    }
}
