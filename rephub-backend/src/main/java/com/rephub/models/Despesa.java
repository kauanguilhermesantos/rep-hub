package com.rephub.models;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

/**
 * Despesa de uma viagem. Fica em coleção própria (e não embutida na viagem) para
 * permitir alterações atômicas sem sobrescrever a viagem e agregações por período
 * e categoria nos relatórios futuros.
 */
@Data
@Document(collection = "despesas")
@CompoundIndexes({
        @CompoundIndex(name = "idx_despesa_viagem_data", def = "{'viagemId': 1, 'data': -1}"),
        @CompoundIndex(name = "idx_despesa_usuario_data", def = "{'usuarioId': 1, 'data': -1}"),
        @CompoundIndex(name = "idx_despesa_usuario_categoria", def = "{'usuarioId': 1, 'categoria': 1}")
})
public class Despesa {

    @Id
    private String id;

    private String viagemId;

    // Dono (normalizado de propósito: permite consultas por representante sem join)
    private String usuarioId;

    private CategoriaDespesa categoria;
    private String descricao;

    // Valor em centavos (ver util.Dinheiro)
    private long valorCentavos;

    private LocalDate data;
    private String observacoes;

    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;
}
