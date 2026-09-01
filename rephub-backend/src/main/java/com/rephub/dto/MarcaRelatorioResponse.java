package com.rephub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MarcaRelatorioResponse {
    private String id;
    private String nome;
    private int totalPedidos;
    private int totalPares;
    private double valorTotalVendas;
    private double valorTotalComissao;
}