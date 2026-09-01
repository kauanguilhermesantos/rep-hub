package com.rephub.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RelatorioGeralResponse {
    private int totalPedidos;
    private int totalPares;
    private double valorTotalVendas;
    private double valorTotalComissao;
    private List<MarcaRelatorioResponse> vendasPorMarca;
}