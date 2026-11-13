package com.rephub.models;

// Como a despesa foi paga. Despesas antigas não têm o campo (null).
public enum FormaPagamento {
    DINHEIRO,
    PIX,
    CARTAO_CREDITO,
    CARTAO_DEBITO,
    TRANSFERENCIA,
    OUTRO
}
