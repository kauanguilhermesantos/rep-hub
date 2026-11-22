package com.rephub.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.rephub.models.Preposto;

import lombok.Builder;
import lombok.Data;

// Sem usuarioId nem auditoria: o dono é sempre quem está logado
@Data
@Builder
public class PrepostoResponse {
    private String id;
    private String nome;
    private String contato;
    private BigDecimal comissaoPercentualPadrao;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private boolean ativo;

    public static PrepostoResponse from(Preposto p) {
        return PrepostoResponse.builder()
                .id(p.getId())
                .nome(p.getNome())
                .contato(p.getContato())
                .comissaoPercentualPadrao(p.getComissaoPercentualPadrao())
                .dataInicio(p.getDataInicio())
                .dataFim(p.getDataFim())
                .ativo(p.isAtivo())
                .build();
    }
}
