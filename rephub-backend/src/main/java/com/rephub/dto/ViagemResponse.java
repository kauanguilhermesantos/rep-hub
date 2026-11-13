package com.rephub.dto;

import java.math.BigDecimal;
import java.math.RoundingMode;
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
    // Indicadores financeiros: sempre calculados na consulta, nunca gravados na viagem
    private BigDecimal totalVendas;          // soma do valorTotal dos pedidos associados
    private BigDecimal resultadoFinanceiro;  // totalVendas - totalDespesas (saldo simplificado, não é lucro líquido)
    private BigDecimal totalComissao;        // soma do valorComissao dos pedidos associados
    private BigDecimal lucro;                // totalComissao - totalDespesas
    private BigDecimal percentualLucro;      // lucro / totalComissao * 100; null quando a comissão é zero
    private int quantidadeDespesas;
    private int quantidadePedidos;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;

    public static ViagemResponse of(Viagem v, long totalDespesasCentavos, int quantidadeDespesas, int quantidadePedidos,
                                    BigDecimal totalVendas, BigDecimal totalComissao) {
        BigDecimal despesas = Dinheiro.deCentavos(totalDespesasCentavos);
        BigDecimal vendas = (totalVendas == null ? BigDecimal.ZERO : totalVendas).setScale(2);
        BigDecimal comissao = (totalComissao == null ? BigDecimal.ZERO : totalComissao).setScale(2);
        BigDecimal lucro = comissao.subtract(despesas);
        return ViagemResponse.builder()
                .id(v.getId())
                .titulo(v.getTitulo())
                .roteiro(v.getRoteiro() != null ? v.getRoteiro() : List.of())
                .dataInicio(v.getDataInicio())
                .dataFinalizacao(v.getDataFinalizacao())
                .observacoes(v.getObservacoes())
                .status(v.getStatus())
                .totalDespesas(despesas)
                .totalVendas(vendas)
                .resultadoFinanceiro(vendas.subtract(despesas))
                .totalComissao(comissao)
                .lucro(lucro)
                .percentualLucro(percentual(lucro, comissao))
                .quantidadeDespesas(quantidadeDespesas)
                .quantidadePedidos(quantidadePedidos)
                .criadoEm(v.getCriadoEm())
                .atualizadoEm(v.getAtualizadoEm())
                .build();
    }

    /** (lucro / comissão) × 100 com 2 casas; sem comissão não há base para o percentual (null). */
    static BigDecimal percentual(BigDecimal lucro, BigDecimal comissao) {
        if (comissao.signum() == 0) {
            return null;
        }
        return lucro.multiply(BigDecimal.valueOf(100)).divide(comissao, 2, RoundingMode.HALF_UP);
    }
}
