package com.rephub.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.rephub.models.Pedido;
import com.rephub.util.Dinheiro;

import lombok.Builder;
import lombok.Data;

// Visão resumida de um pedido existente dentro de uma viagem (o pedido não é copiado nem alterado)
@Data
@Builder
public class PedidoViagemResponse {
    private String id;
    private String cliente;
    private String marcaNome;
    private String estado;
    private String cidade;
    private Integer quantPares;
    private BigDecimal valorTotal;
    private BigDecimal valorComissao;
    private LocalDateTime dataCadastro;

    public static PedidoViagemResponse from(Pedido p) {
        return PedidoViagemResponse.builder()
                .id(p.getId())
                .cliente(p.getCliente())
                .marcaNome(p.getMarca() != null ? p.getMarca().getNome() : null)
                .estado(p.getEstado())
                .cidade(p.getCidade())
                .quantPares(p.getQuantPares())
                .valorTotal(Dinheiro.deDouble(p.getValorTotal()))
                .valorComissao(Dinheiro.deDouble(p.getValorComissao()))
                .dataCadastro(p.getDataCadastro())
                .build();
    }
}
