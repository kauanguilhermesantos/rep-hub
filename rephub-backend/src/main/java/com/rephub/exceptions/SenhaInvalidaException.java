package com.rephub.exceptions;

// Lançada quando a senha atual informada pelo usuário não confere —
// usada tanto na troca de senha quanto na exclusão de conta.
public class SenhaInvalidaException extends RuntimeException {
    public SenhaInvalidaException(String message) {
        super(message);
    }
}