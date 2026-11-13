package com.rephub.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.rephub.models.Despesa;
import com.rephub.models.FormaPagamento;
import com.rephub.util.Dinheiro;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DespesaResponse {
    private String id;
    private String viagemId;
    private String categoria;       // id da categoria
    private String categoriaNome;   // resolvido na leitura
    private boolean categoriaPadrao;
    private String descricao;
    private BigDecimal valor;
    private LocalDate data;
    private FormaPagamento formaPagamento; // null em despesas antigas
    private String observacoes;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;

    // categoria pode ser null se a categoria personalizada não existir mais (dado legado/inconsistente)
    public static DespesaResponse from(Despesa d, CategoriaResponse categoria) {
        return DespesaResponse.builder()
                .id(d.getId())
                .viagemId(d.getViagemId())
                .categoria(d.getCategoria())
                .categoriaNome(categoria != null ? categoria.getNome() : "Categoria removida")
                .categoriaPadrao(categoria != null && categoria.isPadrao())
                .descricao(d.getDescricao())
                .valor(Dinheiro.deCentavos(d.getValorCentavos()))
                .data(d.getData())
                .formaPagamento(d.getFormaPagamento())
                .observacoes(d.getObservacoes())
                .criadoEm(d.getCriadoEm())
                .atualizadoEm(d.getAtualizadoEm())
                .build();
    }
}
