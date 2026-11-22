package com.rephub.dto;

import java.util.List;

import lombok.Builder;
import lombok.Data;

// Mesmo formato de PaginaPedidosResponse, sem o resumo
@Data
@Builder
public class PaginaPrepostosResponse {
    private List<PrepostoResponse> content;
    private int page;          // base 0
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;
}
