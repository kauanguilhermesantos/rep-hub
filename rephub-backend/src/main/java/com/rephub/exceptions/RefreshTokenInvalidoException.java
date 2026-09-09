package com.rephub.exceptions;

public class RefreshTokenInvalidoException extends RuntimeException {
    public RefreshTokenInvalidoException(String message) {
        super(message);
    }
}