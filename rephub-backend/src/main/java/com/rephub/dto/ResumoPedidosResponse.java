package com.rephub.dto;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

// Totais dos pedidos do período (calculados no MongoDB, sobre TODOS os pedidos e não só a página)
@Data
@Builder
public class ResumoPedidosResponse {
    private long totalPedidos;
    private long totalPares;
    private BigDecimal valorTotalVendas;
    private BigDecimal valorTotalComissao;
}