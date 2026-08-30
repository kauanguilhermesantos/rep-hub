package com.rephub.models;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "pedidos")
public class Pedido {
    @Id
    private String id;
    private Usuario usuario; // Referência ao usuário que fez o pedido
    private Marca marca; // Referência à marca do pedido
    private String cliente;
    private Integer quantPares;
    private Double valorTotal;
    private Double comissaoPercentual; // Percentual de comissão do pedido (ex: 5.0 = 5%)
    private Double valorComissao;
    private String condicaoPagamento;
    private LocalDateTime dataCadastro;
    private String anexoUrl; // URL do anexo (foto do pedido)
}