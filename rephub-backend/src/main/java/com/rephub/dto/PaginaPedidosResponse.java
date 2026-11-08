package com.rephub.dto;

import java.util.List;

import com.rephub.models.Pedido;

import lombok.Builder;
import lombok.Data;

// Uma página de pedidos + metadados de paginação + totais do período
@Data
@Builder
public class PaginaPedidosResponse {
    private List<Pedido> content;
    private int page;          // base 0
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;
    private ResumoPedidosResponse resumo;
}