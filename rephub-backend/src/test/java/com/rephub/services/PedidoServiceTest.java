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
import org.springframework.data.mongodb.core.MongoTemplate;

import com.rephub.exceptions.RecursoNaoEncontradoException;
import com.rephub.exceptions.RegraNegocioException;
import com.rephub.models.Pedido;
import com.rephub.models.Preposto;
import com.rephub.models.Usuario;
import com.rephub.repositories.PedidoRepository;
import com.rephub.repositories.PrepostoRepository;
import com.rephub.repositories.UsuarioRepository;

// Usa o MONGO_URI (Atlas), mas sempre no banco rephub_test: o deleteAll() nunca atinge o banco real
@DataMongoTest(properties = "spring.mongodb.database=rephub_test")
@Import({ PedidoService.class, ViagemService.class })
class PedidoServiceTest {

    @Autowired private PedidoService service;
    @Autowired private PedidoRepository pedidos;
    @Autowired private PrepostoRepository prepostos;
    @Autowired private UsuarioRepository usuarios;
    @Autowired private MongoTemplate mongoTemplate;

    private Usuario dono;
    private Preposto ativo;
    private Preposto outroAtivo;
    private Preposto inativo;
    private Preposto deOutroUsuario;

    @BeforeEach
    void preparar() {
        assertThat(mongoTemplate.getDb().getName()).as("trava contra apagar dados reais").isEqualTo("rephub_test");
        mongoTemplate.dropCollection(Pedido.class); // leva junto índices herdados de outros testes (ex.: usuario.email único)
        prepostos.deleteAll();
        usuarios.deleteAll();
        dono = usuario("dono@teste.com");
        Usuario outro = usuario("outro@teste.com");
        ativo = preposto(dono, "2.50", true);
        outroAtivo = preposto(dono, "4.00", true);
        inativo = preposto(dono, "3.00", false);
        deOutroUsuario = preposto(outro, "1.00", true);
    }

    @Test
    void criarComPrepostoAtivoCopiaOPercentual() {
        Pedido criado = service.createPedido(pedido(ativo.getId()));

        assertThat(criado.getPrepostoId()).isEqualTo(ativo.getId());
        assertThat(criado.getComissaoPrepostoPercentual()).isEqualByComparingTo("2.50");
    }

    @Test
    void criarSemPrepostoDeixaVazio() {
        Pedido criado = service.createPedido(pedido(" "));

        assertThat(criado.getPrepostoId()).isNull();
        assertThat(criado.getComissaoPrepostoPercentual()).isNull();
    }

    @Test
    void prepostoDeOutroUsuarioOuInexistenteDa404() {
        assertThatThrownBy(() -> service.createPedido(pedido(deOutroUsuario.getId())))
                .isInstanceOf(RecursoNaoEncontradoException.class);
        assertThatThrownBy(() -> service.createPedido(pedido("nao-existe")))
                .isInstanceOf(RecursoNaoEncontradoException.class);
    }

    @Test
    void prepostoInativoDa409() {
        assertThatThrownBy(() -> service.createPedido(pedido(inativo.getId())))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void editarComMesmoPrepostoMantemPercentualMesmoSeOPadraoMudouOuFoiInativado() {
        Pedido criado = service.createPedido(pedido(ativo.getId()));
        ativo.setComissaoPercentualPadrao(new BigDecimal("9.00"));
        ativo.setAtivo(false);
        prepostos.save(ativo);

        Pedido editado = service.updatePedido(edicao(criado.getId(), ativo.getId()));

        assertThat(editado.getComissaoPrepostoPercentual()).isEqualByComparingTo("2.50");
    }

    @Test
    void trocarPrepostoCopiaONovoPercentual() {
        Pedido criado = service.createPedido(pedido(ativo.getId()));

        Pedido editado = service.updatePedido(edicao(criado.getId(), outroAtivo.getId()));

        assertThat(editado.getPrepostoId()).isEqualTo(outroAtivo.getId());
        assertThat(editado.getComissaoPrepostoPercentual()).isEqualByComparingTo("4.00");
    }

    @Test
    void trocarParaInativoDa409ENaoAlteraOPedido() {
        Pedido criado = service.createPedido(pedido(ativo.getId()));

        assertThatThrownBy(() -> service.updatePedido(edicao(criado.getId(), inativo.getId())))
                .isInstanceOf(RegraNegocioException.class);
        assertThat(pedidos.findById(criado.getId()).orElseThrow().getPrepostoId()).isEqualTo(ativo.getId());
    }

    @Test
    void editarComPrepostoVazioRemoveOVinculo() {
        Pedido criado = service.createPedido(pedido(ativo.getId()));

        Pedido editado = service.updatePedido(edicao(criado.getId(), null));

        assertThat(editado.getPrepostoId()).isNull();
        assertThat(editado.getComissaoPrepostoPercentual()).isNull();
    }

    @Test
    void leituraPreencheNomeDoPrepostoSemSalvarNoBanco() {
        Pedido criado = service.createPedido(pedido(ativo.getId()));
        service.createPedido(pedido(null));
        ativo.setNome("Nome novo");
        prepostos.save(ativo);

        assertThat(criado.getPrepostoNome()).isEqualTo("Preposto 2.50");
        assertThat(service.getPedidosRecentes(dono.getId(), 10)).extracting(Pedido::getPrepostoNome)
                .containsExactlyInAnyOrder("Nome novo", null);
        assertThat(mongoTemplate.getCollection("pedidos").find().into(new java.util.ArrayList<>()))
                .noneMatch(d -> d.containsKey("prepostoNome"));
    }

    private Usuario usuario(String email) {
        Usuario u = new Usuario();
        u.setEmail(email);
        return usuarios.save(u);
    }

    private Preposto preposto(Usuario usuario, String percentual, boolean ativo) {
        Preposto p = new Preposto();
        p.setUsuarioId(usuario.getId());
        p.setNome("Preposto " + percentual);
        p.setComissaoPercentualPadrao(new BigDecimal(percentual));
        p.setDataInicio(LocalDate.now());
        p.setAtivo(ativo);
        return prepostos.save(p);
    }

    private Pedido pedido(String prepostoId) {
        Pedido p = new Pedido();
        p.setUsuario(dono);
        p.setCliente("Cliente");
        p.setPrepostoId(prepostoId);
        return p;
    }

    private Pedido edicao(String id, String prepostoId) {
        Pedido p = new Pedido();
        p.setId(id);
        p.setPrepostoId(prepostoId);
        return p;
    }
}
