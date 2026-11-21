package com.rephub.repositories;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.bson.Document;
import org.bson.types.Decimal128;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.mongodb.test.autoconfigure.DataMongoTest;
import org.springframework.data.mongodb.core.MongoTemplate;

import com.rephub.models.Preposto;

// Precisa de um Mongo acessível em MONGO_URI (ex.: docker run -p 27017:27017 mongo). Não aponte para produção.
@DataMongoTest(properties = "spring.data.mongodb.auto-index-creation=true")
class PrepostoRepositoryTest {

    @Autowired
    private PrepostoRepository repository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @BeforeEach
    void limpar() {
        repository.deleteAll();
    }

    @Test
    void salvaPrepostoLigadoAoUsuarioEInvisivelParaOutros() {
        Preposto p = new Preposto();
        p.setUsuarioId("usuario-a");
        p.setNome("João");
        p.setComissaoPercentualPadrao(new BigDecimal("2.50"));
        p.setDataInicio(LocalDate.of(2026, 11, 1));

        Preposto salvo = repository.save(p);

        Preposto lido = repository.findByIdAndUsuarioId(salvo.getId(), "usuario-a").orElseThrow();
        assertThat(lido.getUsuarioId()).isEqualTo("usuario-a");
        assertThat(lido.isAtivo()).isTrue();
        assertThat(lido.getDataFim()).isNull();
        assertThat(lido.getComissaoPercentualPadrao()).isEqualByComparingTo("2.50");

        assertThat(repository.findByIdAndUsuarioId(salvo.getId(), "usuario-b")).isEmpty();
        assertThat(repository.findByUsuarioId("usuario-b")).isEmpty();

        // Percentual gravado como decimal de verdade, não double nem string
        Document bruto = mongoTemplate.getCollection("prepostos").find().first();
        assertThat(bruto.get("comissaoPercentualPadrao")).isInstanceOf(Decimal128.class);

        assertThat(mongoTemplate.indexOps(Preposto.class).getIndexInfo())
                .anyMatch(i -> i.getName().equals("idx_preposto_usuario_ativo"));
    }
}
