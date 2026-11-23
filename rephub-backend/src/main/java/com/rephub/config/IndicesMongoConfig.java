package com.rephub.config;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.IndexDefinition;
import org.springframework.data.mongodb.core.index.MongoPersistentEntityIndexResolver;
import org.springframework.data.mongodb.core.index.MongoPersistentEntityIndexResolver.IndexDefinitionHolder;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;
import org.springframework.data.mongodb.core.mapping.MongoPersistentEntity;
import org.springframework.data.mongodb.core.mapping.MongoPersistentProperty;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

/**
 * Cria no banco os índices declarados nas entidades (@CompoundIndex / @Indexed) na subida.
 *
 * Substitui o spring.data.mongodb.auto-index-creation, que não pode ser ligado: ele também
 * aplica os índices das classes embutidas. Como Pedido e Marca guardam uma cópia do Usuario,
 * o @Indexed(unique) do e-mail viraria "um pedido/uma marca por usuário" (usuario.email único).
 * Aqui só entram os índices da própria entidade. createIndex é idempotente: índice que já
 * existe igual não muda nada. Índices nunca são apagados (remover a anotação não remove do banco).
 */
@Component
@RequiredArgsConstructor
public class IndicesMongoConfig {

    private static final Logger log = LoggerFactory.getLogger(IndicesMongoConfig.class);

    private final MongoTemplate mongoTemplate;
    private final MongoMappingContext mappingContext;

    @EventListener(ApplicationReadyEvent.class)
    public void criarIndices() {
        for (MongoPersistentEntity<?> entidade : mappingContext.getPersistentEntities()) {
            if (!entidade.isAnnotationPresent(Document.class)) {
                continue;
            }
            for (IndexDefinition indice : indicesProprios(mappingContext, entidade)) {
                try {
                    mongoTemplate.indexOps(entidade.getCollection()).createIndex(indice);
                } catch (RuntimeException e) {
                    // Ex.: duplicatas impedem um índice único. O app segue funcionando sem o índice.
                    log.error("Não foi possível criar o índice {} em {}: {}",
                            indice.getIndexOptions().get("name"), entidade.getCollection(), e.getMessage());
                }
            }
        }
    }

    /** Índices da classe e dos campos simples da própria entidade; ignora os que vêm de objetos embutidos. */
    static List<IndexDefinition> indicesProprios(MongoMappingContext contexto, MongoPersistentEntity<?> entidade) {
        List<IndexDefinition> proprios = new ArrayList<>();
        new MongoPersistentEntityIndexResolver(contexto).resolveIndexFor(entidade.getTypeInformation()).forEach(i -> {
            String caminho = ((IndexDefinitionHolder) i).getPath();
            MongoPersistentProperty campo = caminho.contains(".") ? null : entidade.getPersistentProperty(caminho);
            if (caminho.isEmpty() || (campo != null && !campo.isEntity())) {
                proprios.add(i);
            }
        });
        return proprios;
    }
}
