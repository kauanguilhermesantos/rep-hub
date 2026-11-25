package com.rephub.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import lombok.Data;

@Data
@Document(collection = "pedidos")
// Atende a listagem paginada: filtra por dono + período e ordena por data (mais recente primeiro)
@CompoundIndex(name = "idx_pedido_usuario_data", def = "{'usuario._id': 1, 'dataCadastro': -1}")
// Atende "pedidos do usuário por preposto"
@CompoundIndex(name = "idx_pedido_usuario_preposto", def = "{'usuario._id': 1, 'prepostoId': 1}")
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
    private String estado; // UF do cliente (ex: CE)
    private String cidade; // Cidade do cliente/pedido
    private LocalDateTime dataCadastro;
    private String anexoUrl; // URL do anexo (foto do pedido)
    private String prepostoId; // Preposto que fez a venda (opcional)
    // Cópia do percentual do preposto no momento do pedido: mudar o padrão depois não altera pedidos antigos
    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal comissaoPrepostoPercentual;
    // Só na resposta: preenchido na leitura a partir do prepostoId (não é salvo, o nome pode mudar)
    @Transient
    private String prepostoNome;
}