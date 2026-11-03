package com.rephub.dto;

import java.time.LocalDateTime;

import com.rephub.models.CategoriaDespesa;
import com.rephub.models.CategoriaPersonalizada;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoriaResponse {
    // Padrão: nome do enum (ex.: "COMBUSTIVEL"). Personalizada: id do documento.
    private String id;
    private String nome;
    private boolean padrao;
    private LocalDateTime criadoEm;       // só nas personalizadas
    private LocalDateTime atualizadoEm;   // só nas personalizadas

    public static CategoriaResponse padrao(CategoriaDespesa c) {
        return CategoriaResponse.builder().id(c.name()).nome(c.getNome()).padrao(true).build();
    }

    public static CategoriaResponse personalizada(CategoriaPersonalizada c) {
        return CategoriaResponse.builder()
                .id(c.getId())
                .nome(c.getNome())
                .padrao(false)
                .criadoEm(c.getCriadoEm())
                .atualizadoEm(c.getAtualizadoEm())
                .build();
    }
}
