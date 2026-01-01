package com.contentdiagnostics.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when user lacks permission for an action.
 */
public class ForbiddenException extends ApiException {

    public ForbiddenException(String message) {
        super(message, HttpStatus.FORBIDDEN, "FORBIDDEN");
    }

    public ForbiddenException(String message, String errorCode) {
        super(message, HttpStatus.FORBIDDEN, errorCode);
    }
}
