package com.rephub.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Builder;
import lombok.Data;

// Pedidos associados a uma viagem + resultado comercial (base para comparar com as despesas)
@Data
@Builder
public class PedidosViagemResponse {
    private List<PedidoViagemResponse> pedidos;
    private int quantidadePedidos;
    private BigDecimal valorTotalPedidos;
    private BigDecimal valorTotalComissao;
}
