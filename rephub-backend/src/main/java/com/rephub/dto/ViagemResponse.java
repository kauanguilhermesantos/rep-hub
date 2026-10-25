package com.rephub.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.rephub.models.StatusViagem;
import com.rephub.models.Viagem;
import com.rephub.util.Dinheiro;

import lombok.Builder;
import lombok.Data;

// Dados da viagem + totais calculados na consulta (usado na listagem e dentro do detalhe)
@Data
@Builder
public class ViagemResponse {
    private String id;
    private String titulo;
    private List<String> roteiro;
    private LocalDate dataInicio;
    private LocalDateTime dataFinalizacao;
    private String observacoes;
    private StatusViagem status;
    private BigDecimal totalDespesas;
    private int quantidadeDespesas;
    private int quantidadePedidos;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;

    public static ViagemResponse of(Viagem v, long totalDespesasCentavos, int quantidadeDespesas, int quantidadePedidos) {
        return ViagemResponse.builder()
                .id(v.getId())
                .titulo(v.getTitulo())
                .roteiro(v.getRoteiro() != null ? v.getRoteiro() : List.of())
                .dataInicio(v.getDataInicio())
                .dataFinalizacao(v.getDataFinalizacao())
                .observacoes(v.getObservacoes())
                .status(v.getStatus())
                .totalDespesas(Dinheiro.deCentavos(totalDespesasCentavos))
                .quantidadeDespesas(quantidadeDespesas)
                .quantidadePedidos(quantidadePedidos)
                .criadoEm(v.getCriadoEm())
                .atualizadoEm(v.getAtualizadoEm())
                .build();
    }
}
