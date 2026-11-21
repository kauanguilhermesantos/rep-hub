package com.rephub.models;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import lombok.Data;

/**
 * Pessoa que trabalha para o representante e recebe comissão sobre pedidos.
 * Só o dono (usuarioId) enxerga e gerencia seus prepostos.
 */
@Data
@Document(collection = "prepostos")
// Atende "prepostos do usuário" e "prepostos ativos do usuário"
@CompoundIndex(name = "idx_preposto_usuario_ativo", def = "{'usuarioId': 1, 'ativo': 1}")
public class Preposto {

    @Id
    private String id;

    // Dono. Sempre vem da identidade autenticada, nunca do corpo da requisição.
    private String usuarioId;

    private String nome;

    // Telefone ou e-mail, texto livre (opcional)
    private String contato;

    // 0 a 100 com 2 casas (ex.: 2.50 = 2,5%). Decimal128 no Mongo: exato, sem erro de ponto flutuante.
    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal comissaoPercentualPadrao;

    private LocalDate dataInicio;

    // Vazia = preposto ainda ativo
    private LocalDate dataFim;

    private boolean ativo = true;

    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;
}
