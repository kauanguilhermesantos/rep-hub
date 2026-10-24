package com.rephub.models;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

/**
 * Viagem de trabalho do representante.
 *
 * Totais (despesas, pedidos) NÃO são guardados aqui: são calculados na consulta a
 * partir das despesas e dos pedidos referenciados, para nunca ficarem inconsistentes.
 * Os pedidos são apenas referenciados por id — nunca copiados.
 */
@Data
@Document(collection = "viagens")
@CompoundIndexes({
        @CompoundIndex(name = "idx_viagem_usuario_inicio", def = "{'usuarioId': 1, 'dataInicio': -1}"),
        @CompoundIndex(name = "idx_viagem_usuario_status", def = "{'usuarioId': 1, 'status': 1}")
})
public class Viagem {

    @Id
    private String id;

    // Dono da viagem. Sempre vem da identidade autenticada, nunca do corpo da requisição.
    private String usuarioId;

    private String titulo;

    // Municípios visitados, na ordem (opcional). Ex.: ["São Luís", "Axixá"]
    private List<String> roteiro = new ArrayList<>();

    private LocalDate dataInicio;

    // Preenchida somente ao finalizar (data e hora efetivas)
    private LocalDateTime dataFinalizacao;

    private String observacoes;

    private StatusViagem status = StatusViagem.EM_ANDAMENTO;

    // Referências para pedidos existentes (coleção "pedidos")
    @Indexed
    private List<String> pedidoIds = new ArrayList<>();

    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;
}
