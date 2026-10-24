package com.rephub.exceptions;

// Operação válida em formato, mas não permitida pelo estado atual (ex.: viagem finalizada)
public class RegraNegocioException extends RuntimeException {
    public RegraNegocioException(String message) {
        super(message);
    }
}
