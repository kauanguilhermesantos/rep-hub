package com.rephub.dto;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

// Total de despesas de uma categoria dentro de uma viagem
@Data
@Builder
public class TotalCategoriaResponse {
    private String categoria;      // id da categoria
    private String categoriaNome;
    private boolean padrao;
    private BigDecimal total;
}
