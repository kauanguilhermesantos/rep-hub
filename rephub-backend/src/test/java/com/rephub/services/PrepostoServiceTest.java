package com.rephub.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.mongodb.test.autoconfigure.DataMongoTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.rephub.dto.PaginaPrepostosResponse;
import com.rephub.dto.PrepostoResponse;
import com.rephub.exceptions.RecursoNaoEncontradoException;
import com.rephub.models.Preposto;
import com.rephub.repositories.PrepostoRepository;

// Precisa de um Mongo acessível em MONGO_URI (ex.: docker run -p 27017:27017 mongo). Não aponte para produção.
@DataMongoTest
@Import(PrepostoService.class)
class PrepostoServiceTest {

    @Autowired
    private PrepostoService service;

    @Autowired
    private PrepostoRepository repository;

    private Preposto doB;

    @BeforeEach
    void preparar() {
        repository.deleteAll();
        salvar("usuario-a", "Carlos", true);
        salvar("usuario-a", "ana", true);
        salvar("usuario-a", "Bruno", false);
        doB = salvar("usuario-b", "Anabela", true);
    }

    @Test
    void usuarioSoVeOsPropriosAtivosOrdenadosPorNome() {
        PaginaPrepostosResponse pagina = service.listar("usuario-a", "ativos", null, 0, 20, "nome", "asc");

        assertThat(pagina.getContent()).extracting(PrepostoResponse::getNome).containsExactly("Carlos", "ana");
        assertThat(pagina.getTotalElements()).isEqualTo(2);
    }

    @Test
    void filtraInativosTodosEBuscaSemDiferenciarMaiusculas() {
        assertThat(service.listar("usuario-a", "inativos", null, 0, 20, "nome", "asc").getContent())
                .extracting(PrepostoResponse::getNome).containsExactly("Bruno");
        assertThat(service.listar("usuario-a", "todos", null, 0, 20, "nome", "asc").getTotalElements())
                .isEqualTo(3);
        // "ANA" não pode trazer a Anabela do usuário B; ".*" é texto, não regex
        assertThat(service.listar("usuario-a", "todos", "ANA", 0, 20, "nome", "asc").getContent())
                .extracting(PrepostoResponse::getNome).containsExactly("ana");
        assertThat(service.listar("usuario-a", "todos", ".*", 0, 20, "nome", "asc").getContent()).isEmpty();
    }

    @Test
    void paginaComMaisDeUmaPagina() {
        PaginaPrepostosResponse p1 = service.listar("usuario-a", "todos", null, 1, 2, "nome", "asc");

        assertThat(p1.getContent()).hasSize(1);
        assertThat(p1.getTotalPages()).isEqualTo(2);
        assertThat(p1.isLast()).isTrue();
    }

    @Test
    void buscarPrepostoDeOutroUsuarioDaNaoEncontrado() {
        assertThatThrownBy(() -> service.buscar("usuario-a", doB.getId()))
                .isInstanceOf(RecursoNaoEncontradoException.class);
        assertThat(service.buscar("usuario-b", doB.getId()).getNome()).isEqualTo("Anabela");
    }

    @Test
    void parametrosInvalidosDao400() {
        assertBadRequest(() -> service.listar("usuario-a", "ativos", null, 0, 101, "nome", "asc"));
        assertBadRequest(() -> service.listar("usuario-a", "ativos", null, 0, 0, "nome", "asc"));
        assertBadRequest(() -> service.listar("usuario-a", "ativos", null, -1, 20, "nome", "asc"));
        assertBadRequest(() -> service.listar("usuario-a", "ativos", null, 0, 20, "usuarioId", "asc"));
        assertBadRequest(() -> service.listar("usuario-a", "ativos", null, 0, 20, "nome", "cima"));
        assertBadRequest(() -> service.listar("usuario-a", "x", null, 0, 20, "nome", "asc"));
    }

    private void assertBadRequest(org.assertj.core.api.ThrowableAssert.ThrowingCallable chamada) {
        assertThatThrownBy(chamada).isInstanceOfSatisfying(ResponseStatusException.class,
                e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    private Preposto salvar(String usuarioId, String nome, boolean ativo) {
        Preposto p = new Preposto();
        p.setUsuarioId(usuarioId);
        p.setNome(nome);
        p.setComissaoPercentualPadrao(new BigDecimal("2.50"));
        p.setDataInicio(LocalDate.of(2026, 1, 1));
        p.setAtivo(ativo);
        return repository.save(p);
    }
}
