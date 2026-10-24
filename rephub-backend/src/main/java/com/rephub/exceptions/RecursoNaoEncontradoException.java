package com.rephub.exceptions;

// Recurso inexistente OU pertencente a outro usuário (mesma resposta, para não revelar que existe)
public class RecursoNaoEncontradoException extends RuntimeException {
    public RecursoNaoEncontradoException(String message) {
        super(message);
    }
}
