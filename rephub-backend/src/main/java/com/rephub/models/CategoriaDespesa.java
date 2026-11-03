package com.rephub.models;

import lombok.Getter;

/**
 * Categorias PADRÃO, disponíveis para todos os representantes. Não ficam no banco: são
 * constantes do código. O nome do enum (ex.: "COMBUSTIVEL") é o identificador delas e é
 * exatamente o valor que as despesas antigas já têm gravado em "categoria".
 //
 * As categorias personalizadas vivem na coleção "categorias_despesa" (CategoriaPersonalizada)
 * e são referenciadas pelo id do documento.
 */
@Getter
public enum CategoriaDespesa {
    ALIMENTACAO("Alimentação"),
    HOSPEDAGEM("Hospedagem"),
    COMBUSTIVEL("Combustível"),
    TRANSPORTE("Transporte"),
    ESTACIONAMENTO("Estacionamento"),
    OUTROS("Outros");

    private final String nome;

    CategoriaDespesa(String nome) {
        this.nome = nome;
    }

}
