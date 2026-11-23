package com.rephub.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.mongodb.test.autoconfigure.DataMongoTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.rephub.dto.PaginaPrepostosResponse;
import com.rephub.dto.PrepostoRequest;
import com.rephub.dto.PrepostoResponse;
import com.rephub.exceptions.CampoInvalidoException;
import com.rephub.exceptions.RecursoNaoEncontradoException;
import com.rephub.models.Preposto;
import com.rephub.repositories.PrepostoRepository;

// Usa o MONGO_URI (Atlas), mas sempre no banco rephub_test: o deleteAll() nunca atinge o banco real
@DataMongoTest(properties = "spring.mongodb.database=rephub_test")
@Import(PrepostoService.class)
class PrepostoServiceTest {

    @Autowired
    private PrepostoService service;

    @Autowired
    private PrepostoRepository repository;

    @Autowired
    private MongoTemplate mongoTemplate;

    private Preposto doB;

    @BeforeEach
    void preparar() {
        assertThat(mongoTemplate.getDb().getName()).as("trava contra apagar dados reais").isEqualTo("rephub_test");
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

    // ---- criar / editar ----

    private PrepostoRequest request(String nome, String contato, String percentual, LocalDate inicio, LocalDate fim) {
        PrepostoRequest r = new PrepostoRequest();
        r.setNome(nome);
        r.setContato(contato);
        r.setComissaoPercentualPadrao(new BigDecimal(percentual));
        r.setDataInicio(inicio);
        r.setDataFim(fim);
        return r;
    }

    @Test
    void criarGravaDonoDoTokenAtivoENormalizaTextos() {
        LocalDateTime antes = LocalDateTime.now().minusSeconds(1);

        PrepostoResponse criado = service.criar("usuario-a",
                request("  Maria Souza  ", "   ", "3.75", LocalDate.of(2026, 2, 1), null));

        Preposto salvo = repository.findById(criado.getId()).orElseThrow();
        assertThat(salvo.getUsuarioId()).isEqualTo("usuario-a");
        assertThat(salvo.getNome()).isEqualTo("Maria Souza");
        assertThat(salvo.getContato()).isNull();
        assertThat(salvo.getComissaoPercentualPadrao()).isEqualByComparingTo("3.75");
        assertThat(salvo.isAtivo()).isTrue();
        assertThat(salvo.getCriadoEm()).isAfter(antes);
        assertThat(salvo.getAtualizadoEm()).isEqualTo(salvo.getCriadoEm());
    }

    @Test
    void criarComDataFimNasceInativo() {
        PrepostoResponse criado = service.criar("usuario-a",
                request("Ex-preposto", null, "2", LocalDate.of(2025, 1, 1), LocalDate.of(2025, 6, 30)));

        assertThat(criado.isAtivo()).isFalse();
        assertThat(criado.getDataFim()).isEqualTo(LocalDate.of(2025, 6, 30));
    }

    @Test
    void dataFimAnteriorAoInicioDaErroNoCampo() {
        PrepostoRequest invalido = request("X", null, "2", LocalDate.of(2026, 5, 1), LocalDate.of(2026, 4, 30));

        assertThatThrownBy(() -> service.criar("usuario-a", invalido))
                .isInstanceOfSatisfying(CampoInvalidoException.class, e -> assertThat(e.getCampo()).isEqualTo("dataFim"));
        assertThatThrownBy(() -> service.editar("usuario-b", doB.getId(), invalido))
                .isInstanceOf(CampoInvalidoException.class);
        assertThat(repository.count()).isEqualTo(4); // nada foi criado
    }

    @Test
    void editarTrocaDadosCadastraisEMantemDonoAtivoECriadoEm() {
        Preposto antes = repository.findById(doB.getId()).orElseThrow();

        PrepostoResponse editado = service.editar("usuario-b", doB.getId(),
                request(" Anabela Lima ", "anabela@email.com", "4.00", LocalDate.of(2026, 3, 1), LocalDate.of(2026, 12, 31)));

        Preposto depois = repository.findById(doB.getId()).orElseThrow();
        assertThat(editado.getNome()).isEqualTo("Anabela Lima");
        assertThat(depois.getContato()).isEqualTo("anabela@email.com");
        assertThat(depois.getComissaoPercentualPadrao()).isEqualByComparingTo("4.00");
        assertThat(depois.getDataInicio()).isEqualTo(LocalDate.of(2026, 3, 1));
        assertThat(depois.getDataFim()).isEqualTo(LocalDate.of(2026, 12, 31));
        assertThat(depois.getUsuarioId()).isEqualTo("usuario-b");
        assertThat(depois.isAtivo()).isTrue(); // só inativar/reativar mudam a situação
        assertThat(depois.getCriadoEm()).isEqualTo(antes.getCriadoEm());
        assertThat(depois.getAtualizadoEm()).isAfter(antes.getAtualizadoEm());
    }

    @Test
    void editarPrepostoDeOutroUsuarioOuInexistenteDa404ESemAlterar() {
        PrepostoRequest r = request("Hackeado", null, "99", LocalDate.of(2026, 1, 1), null);

        assertThatThrownBy(() -> service.editar("usuario-a", doB.getId(), r))
                .isInstanceOf(RecursoNaoEncontradoException.class);
        assertThatThrownBy(() -> service.editar("usuario-a", "000000000000000000000000", r))
                .isInstanceOf(RecursoNaoEncontradoException.class);

        Preposto intacto = repository.findById(doB.getId()).orElseThrow();
        assertThat(intacto.getNome()).isEqualTo("Anabela");
        assertThat(intacto.getComissaoPercentualPadrao()).isEqualByComparingTo("2.50");
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
        p.setCriadoEm(LocalDateTime.now().minusDays(1));
        p.setAtualizadoEm(p.getCriadoEm());
        return repository.save(p);
    }
}
