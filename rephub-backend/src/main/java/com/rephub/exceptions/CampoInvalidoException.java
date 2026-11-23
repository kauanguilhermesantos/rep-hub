package com.rephub.exceptions;

import lombok.Getter;

// Validação feita no service que deve chegar ao frontend como erro de campo: 400 { "campo": "mensagem" }
@Getter
public class CampoInvalidoException extends RuntimeException {
    private final String campo;

    public CampoInvalidoException(String campo, String message) {
        super(message);
        this.campo = campo;
    }
}
