package com.rephub.models;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

/** Categoria de despesa criada por um representante. Só ele a enxerga e gerencia. */
@Data
@Document(collection = "categorias_despesa")
@CompoundIndexes({
        // Impede duplicadas por representante mesmo sob requisições simultâneas
        @CompoundIndex(name = "uk_categoria_usuario_nome", def = "{'usuarioId': 1, 'nomeNormalizado': 1}", unique = true)
})
public class CategoriaPersonalizada {

    @Id
    private String id;

    // Dono (sempre vem da identidade autenticada)
    private String usuarioId;

    // Como o usuário digitou (espaços extras removidos)
    private String nome;

    // Chave de comparação: sem acentos, minúsculas, espaços colapsados
    private String nomeNormalizado;

    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;
}
