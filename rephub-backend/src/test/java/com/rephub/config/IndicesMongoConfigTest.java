package com.rephub.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;

import com.rephub.models.Marca;
import com.rephub.models.Pedido;
import com.rephub.models.Preposto;
import com.rephub.models.Usuario;
import com.rephub.models.Viagem;

// Sem banco: só confere quais índices seriam criados
class IndicesMongoConfigTest {

    private final MongoMappingContext contexto = new MongoMappingContext();

    IndicesMongoConfigTest() {
        contexto.setSimpleTypeHolder(new MongoCustomConversions(List.of()).getSimpleTypeHolder());
    }

    private List<String> nomes(Class<?> tipo) {
        return IndicesMongoConfig.indicesProprios(contexto, contexto.getRequiredPersistentEntity(tipo)).stream()
                .map(i -> (String) i.getIndexOptions().get("name"))
                .toList();
    }

    @Test
    void ignoraIndicesDoUsuarioEmbutidoEmPedidoEMarca() {
        // Sem "usuario.email" único: isso limitaria a um pedido/uma marca por usuário
        assertThat(nomes(Pedido.class)).containsExactlyInAnyOrder("idx_pedido_usuario_data", "idx_pedido_usuario_preposto");
        assertThat(nomes(Marca.class)).isEmpty();
    }

    @Test
    void mantemIndicesDaPropriaEntidade() {
        assertThat(nomes(Usuario.class)).containsExactly("email");
        assertThat(nomes(Preposto.class)).containsExactly("idx_preposto_usuario_ativo");
        assertThat(nomes(Viagem.class))
                .containsExactlyInAnyOrder("idx_viagem_usuario_inicio", "idx_viagem_usuario_status", "pedidoIds");
    }
}
