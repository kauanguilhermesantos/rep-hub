package com.rephub.dto;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.function.Function;

import com.rephub.util.Dinheiro;

import lombok.Builder;
import lombok.Data;

// Despesas de uma viagem agrupadas por forma de pagamento ou categoria (todas, sem paginação)
@Data
@Builder
public class RelatorioDespesasResponse {

    public enum Agrupamento { FORMA_PAGAMENTO, CATEGORIA }

    /** Chave do grupo de despesas sem o campo (ex.: despesas antigas sem forma de pagamento). */
    public static final String NAO_INFORMADO = "NAO_INFORMADO";

    private BigDecimal totalDespesas;
    private long quantidadeDespesas;
    private List<Item> grupos; // maior valor primeiro

    @Data
    @Builder
    public static class Item {
        private String chave;          // nome do enum FormaPagamento, id da categoria ou NAO_INFORMADO
        private String nome;           // nome da categoria; null para forma (o rótulo é do frontend)
        private long quantidade;
        private BigDecimal total;
        private BigDecimal percentual; // total / total geral × 100, 2 casas
    }

    /** Resultado de um $group no Mongo: _id é o valor agrupado (null quando o campo falta). */
    public record Grupo(String id, long totalCentavos, long quantidade) {
    }

    public static RelatorioDespesasResponse of(List<Grupo> grupos, Function<String, String> nome) {
        long totalCentavos = grupos.stream().mapToLong(Grupo::totalCentavos).sum();

        List<Item> itens = grupos.stream()
                .sorted(Comparator.comparingLong(Grupo::totalCentavos).reversed())
                .map(g -> {
                    String chave = g.id() == null ? NAO_INFORMADO : g.id();
                    return Item.builder()
                            .chave(chave)
                            .nome(nome.apply(chave))
                            .quantidade(g.quantidade())
                            .total(Dinheiro.deCentavos(g.totalCentavos()))
                            .percentual(totalCentavos == 0 ? BigDecimal.ZERO.setScale(2)
                                    : BigDecimal.valueOf(g.totalCentavos() * 100)
                                            .divide(BigDecimal.valueOf(totalCentavos), 2, RoundingMode.HALF_UP))
                            .build();
                })
                .toList();

        return RelatorioDespesasResponse.builder()
                .totalDespesas(Dinheiro.deCentavos(totalCentavos))
                .quantidadeDespesas(grupos.stream().mapToLong(Grupo::quantidade).sum())
                .grupos(itens)
                .build();
    }
}
