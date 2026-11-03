package com.rephub.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Builder;
import lombok.Data;

// Lista de despesas de uma viagem com os totais calculados na hora
@Data
@Builder
public class DespesasViagemResponse {
    private List<DespesaResponse> despesas;
    private BigDecimal totalDespesas;
    // Só categorias que têm despesa
    private List<TotalCategoriaResponse> totalPorCategoria;
}
