package com.rephub.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.rephub.models.CategoriaDespesa;
import com.rephub.models.Despesa;
import com.rephub.util.Dinheiro;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DespesaResponse {
    private String id;
    private String viagemId;
    private CategoriaDespesa categoria;
    private String descricao;
    private BigDecimal valor;
    private LocalDate data;
    private String observacoes;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;

    public static DespesaResponse from(Despesa d) {
        return DespesaResponse.builder()
                .id(d.getId())
                .viagemId(d.getViagemId())
                .categoria(d.getCategoria())
                .descricao(d.getDescricao())
                .valor(Dinheiro.deCentavos(d.getValorCentavos()))
                .data(d.getData())
                .observacoes(d.getObservacoes())
                .criadoEm(d.getCriadoEm())
                .atualizadoEm(d.getAtualizadoEm())
                .build();
    }
}
