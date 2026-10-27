package com.rephub.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import com.rephub.dto.PedidoViagemResponse;
import com.rephub.dto.PedidosViagemResponse;
import com.rephub.dto.ViagemRequest;
import com.rephub.dto.ViagemResponse;
import com.rephub.exceptions.RecursoNaoEncontradoException;
import com.rephub.exceptions.RegraNegocioException;
import com.rephub.models.Despesa;
import com.rephub.models.Pedido;
import com.rephub.models.StatusViagem;
import com.rephub.models.Viagem;
import com.rephub.repositories.DespesaRepository;
import com.rephub.repositories.PedidoRepository;
import com.rephub.repositories.ViagemRepository;

import com.rephub.util.Dinheiro;

import lombok.RequiredArgsConstructor;

/**
 * Cadastro, consulta e edição de viagens. Toda operação recebe o id do usuário
 * autenticado (nunca vindo do corpo) e só enxerga viagens dele: a de outro usuário
 * responde como "não encontrada".
 *
 * Regras após a FINALIZAÇÃO (decisão do Dia 1, aplicada igual em todos os endpoints):
 *  - dados gerais (título, roteiro, início, observações): editáveis;
 *  - despesas: criar/editar/excluir permitidos (ver DespesaService);
 *  - pedidos: associar/remover BLOQUEADOS (409), conferido de forma atômica no banco;
 *  - status e data de finalização: só mudam em finalizar(), nunca por edição genérica.
 *
 * Pedidos: a viagem guarda apenas os ids (referência); o pedido original nunca é copiado
 * nem alterado. Um pedido só pode estar em UMA viagem (evita contar o mesmo pedido duas
 * vezes nos relatórios); repetir a associação na mesma viagem é ignorado (sem duplicar).
 */
@Service
@RequiredArgsConstructor
public class ViagemService {

    /** Mude para true para permitir associar/remover pedidos também depois de finalizada. */
    static final boolean PEDIDOS_EDITAVEIS_APOS_FINALIZACAO = false;

    private final ViagemRepository viagemRepository;
    private final DespesaRepository despesaRepository;
    private final PedidoRepository pedidoRepository;
    private final MongoTemplate mongoTemplate;

    public ViagemResponse criar(String usuarioId, ViagemRequest request) {
        LocalDateTime agora = LocalDateTime.now();

        Viagem viagem = new Viagem();
        viagem.setUsuarioId(usuarioId);
        viagem.setTitulo(request.getTitulo().trim());
        viagem.setRoteiro(normalizarRoteiro(request.getRoteiro()));
        viagem.setDataInicio(request.getDataInicio());
        viagem.setObservacoes(normalizarTexto(request.getObservacoes()));
        viagem.setStatus(StatusViagem.EM_ANDAMENTO); // valor inicial definido pelo backend
        viagem.setDataFinalizacao(null);
        viagem.setPedidoIds(new ArrayList<>());
        viagem.setCriadoEm(agora);
        viagem.setAtualizadoEm(agora);

        return paraResposta(viagemRepository.save(viagem));
    }

    /** Viagens do usuário, da mais recente para a mais antiga. Período filtra pela data de início. */
    public List<ViagemResponse> listar(String usuarioId, StatusViagem status, LocalDate inicio, LocalDate fim) {
        if (inicio != null && fim != null && inicio.isAfter(fim)) {
            throw new RegraNegocioException("A data inicial do filtro não pode ser posterior à data final");
        }

        Criteria criterios = Criteria.where("usuarioId").is(usuarioId);
        if (status != null) {
            criterios = criterios.and("status").is(status);
        }
        if (inicio != null && fim != null) {
            criterios = criterios.and("dataInicio").gte(inicio).lte(fim);
        } else if (inicio != null) {
            criterios = criterios.and("dataInicio").gte(inicio);
        } else if (fim != null) {
            criterios = criterios.and("dataInicio").lte(fim);
        }

        Query query = new Query(criterios)
                .with(Sort.by(Sort.Order.desc("dataInicio"), Sort.Order.desc("criadoEm")));
        List<Viagem> viagens = mongoTemplate.find(query, Viagem.class);
        if (viagens.isEmpty()) {
            return List.of();
        }

        // Uma consulta só para as despesas de todas as viagens (evita N+1)
        List<String> ids = viagens.stream().map(Viagem::getId).collect(Collectors.toList());
        Map<String, List<Despesa>> despesas = despesaRepository.findByUsuarioIdAndViagemIdIn(usuarioId, ids)
                .stream().collect(Collectors.groupingBy(Despesa::getViagemId));

        return viagens.stream()
                .map(v -> resposta(v, despesas.getOrDefault(v.getId(), List.of())))
                .collect(Collectors.toList());
    }

    public ViagemResponse buscar(String usuarioId, String id) {
        return paraResposta(obter(usuarioId, id));
    }

    public ViagemResponse atualizar(String usuarioId, String id, ViagemRequest request) {
        Viagem atual = obter(usuarioId, id);

        if (atual.getStatus() == StatusViagem.FINALIZADA
                && atual.getDataFinalizacao() != null
                && request.getDataInicio().isAfter(atual.getDataFinalizacao().toLocalDate())) {
            throw new RegraNegocioException("A data de início não pode ser posterior à data de finalização");
        }

        // $set só dos campos editáveis: status, dataFinalizacao, pedidos e dono nunca são tocados,
        // e uma finalização concorrente não é desfeita.
        Update update = new Update()
                .set("titulo", request.getTitulo().trim())
                .set("roteiro", normalizarRoteiro(request.getRoteiro()))
                .set("dataInicio", request.getDataInicio())
                .set("observacoes", normalizarTexto(request.getObservacoes()))
                .set("atualizadoEm", LocalDateTime.now());

        Viagem nova = mongoTemplate.findAndModify(alvo(id, usuarioId, false), update, retornarNovo(), Viagem.class);
        if (nova == null) {
            throw naoEncontrada();
        }
        return paraResposta(nova);
    }


    // ---------------------------------------------------------------- finalização

    /**
     * Finaliza a viagem. Idempotente e segura contra concorrência: a troca de status é UMA
     * operação atômica condicionada a status = EM_ANDAMENTO. Quem chega depois (ou repete a
     * chamada) recebe a viagem como está, sem alterar a data de finalização original.
     * Os totais não são gravados: continuam calculados a partir de despesas e pedidos.
     */
    public ViagemResponse finalizar(String usuarioId, String id) {
        Viagem atual = obter(usuarioId, id);

        if (atual.getStatus() == StatusViagem.FINALIZADA) {
            return paraResposta(atual);
        }

        if (atual.getDataInicio() != null && atual.getDataInicio().isAfter(LocalDate.now())) {
            throw new RegraNegocioException("Não é possível finalizar uma viagem que ainda não começou");
        }

        LocalDateTime agora = LocalDateTime.now();
        Update update = new Update()
                .set("status", StatusViagem.FINALIZADA)
                .set("dataFinalizacao", agora)
                .set("atualizadoEm", agora);

        Viagem finalizada = mongoTemplate.findAndModify(
                alvo(id, usuarioId, true), update, retornarNovo(), Viagem.class);
        if (finalizada == null) {
            // Outra requisição finalizou primeiro: devolve o que já foi gravado
            finalizada = obter(usuarioId, id);
        }
        return paraResposta(finalizada);
    }

    // ---------------------------------------------------------------- pedidos

    public PedidosViagemResponse pedidos(String usuarioId, String id) {
        return montarPedidos(obter(usuarioId, id));
    }

    /** Pedidos do usuário que ainda não pertencem a nenhuma viagem dele. */
    public List<PedidoViagemResponse> pedidosDisponiveis(String usuarioId, String id) {
        obter(usuarioId, id);

        Set<String> jaAssociados = new HashSet<>();
        for (Viagem v : viagemRepository.findByUsuarioId(usuarioId)) {
            if (v.getPedidoIds() != null) {
                jaAssociados.addAll(v.getPedidoIds());
            }
        }

        return pedidoRepository.findByUsuario_IdOrderByDataCadastroDesc(usuarioId).stream()
                .filter(p -> !jaAssociados.contains(p.getId()))
                .map(PedidoViagemResponse::from)
                .collect(Collectors.toList());
    }

    public PedidosViagemResponse associarPedidos(String usuarioId, String id, List<String> pedidoIds) {
        Viagem viagem = obter(usuarioId, id);
        exigirPedidosEditaveis(viagem);

        Set<String> solicitados = new LinkedHashSet<>(pedidoIds);

        // Todos precisam existir e ser do usuário autenticado; senão "não encontrado"
        List<Pedido> encontrados = new ArrayList<>();
        pedidoRepository.findAllById(solicitados).forEach(encontrados::add);
        boolean validos = encontrados.size() == solicitados.size()
                && encontrados.stream().allMatch(p -> pertenceAoUsuario(p, usuarioId));
        if (!validos) {
            throw new RecursoNaoEncontradoException("Pedido não encontrado");
        }

        // Os já associados a ESTA viagem são ignorados (sem duplicar, sem erro)
        Set<String> novos = new LinkedHashSet<>(solicitados);
        if (viagem.getPedidoIds() != null) {
            novos.removeAll(viagem.getPedidoIds());
        }

        if (!novos.isEmpty()) {
            if (existeEmOutraViagem(usuarioId, id, novos)) {
                throw new RegraNegocioException("Um dos pedidos já está associado a outra viagem");
            }

            Update update = new Update()
                    .addToSet("pedidoIds").each(novos.toArray())
                    .set("atualizadoEm", LocalDateTime.now());
            Viagem atualizada = mongoTemplate.findAndModify(
                    alvo(id, usuarioId, !PEDIDOS_EDITAVEIS_APOS_FINALIZACAO), update, retornarNovo(), Viagem.class);
            if (atualizada == null) {
                // Finalizada entre a leitura e a escrita
                throw new RegraNegocioException("Não é possível alterar os pedidos de uma viagem finalizada");
            }

            // Verificação após gravar: se outra requisição concorrente associou o mesmo pedido a
            // outra viagem, desfaz o que foi adicionado aqui (nunca fica pedido em duas viagens).
            if (existeEmOutraViagem(usuarioId, id, novos)) {
                mongoTemplate.updateFirst(alvo(id, usuarioId, false),
                        new Update().pullAll("pedidoIds", novos.toArray()), Viagem.class);
                throw new RegraNegocioException("Um dos pedidos já está associado a outra viagem");
            }
        }

        return montarPedidos(obter(usuarioId, id));
    }

    public PedidosViagemResponse removerPedido(String usuarioId, String id, String pedidoId) {
        Viagem viagem = obter(usuarioId, id);
        exigirPedidosEditaveis(viagem);

        if (viagem.getPedidoIds() == null || !viagem.getPedidoIds().contains(pedidoId)) {
            throw new RecursoNaoEncontradoException("Pedido não está associado a esta viagem");
        }

        Update update = new Update()
                .pull("pedidoIds", pedidoId)
                .set("atualizadoEm", LocalDateTime.now());
        Viagem atualizada = mongoTemplate.findAndModify(
                alvo(id, usuarioId, !PEDIDOS_EDITAVEIS_APOS_FINALIZACAO), update, retornarNovo(), Viagem.class);
        if (atualizada == null) {
            throw new RegraNegocioException("Não é possível alterar os pedidos de uma viagem finalizada");
        }
        return montarPedidos(atualizada);
    }

    /** Chamado ao excluir um pedido: remove a referência de qualquer viagem (evita id solto). */
    public void desassociarPedidoExcluido(String pedidoId) {
        mongoTemplate.updateMulti(
                new Query(Criteria.where("pedidoIds").is(pedidoId)),
                new Update().pull("pedidoIds", pedidoId),
                Viagem.class);
    }

    // ---------------------------------------------------------------- apoio

    private void exigirPedidosEditaveis(Viagem viagem) {
        if (!PEDIDOS_EDITAVEIS_APOS_FINALIZACAO && viagem.getStatus() == StatusViagem.FINALIZADA) {
            throw new RegraNegocioException("Não é possível alterar os pedidos de uma viagem finalizada");
        }
    }

    private boolean existeEmOutraViagem(String usuarioId, String viagemId, Set<String> pedidoIds) {
        Query query = new Query(Criteria.where("usuarioId").is(usuarioId)
                .and("id").ne(viagemId)
                .and("pedidoIds").in(pedidoIds));
        return mongoTemplate.exists(query, Viagem.class);
    }

    private Query alvo(String id, String usuarioId, boolean somenteEmAndamento) {
        Criteria criterios = Criteria.where("id").is(id).and("usuarioId").is(usuarioId);
        if (somenteEmAndamento) {
            criterios = criterios.and("status").is(StatusViagem.EM_ANDAMENTO);
        }
        return new Query(criterios);
    }

    private FindAndModifyOptions retornarNovo() {
        return FindAndModifyOptions.options().returnNew(true);
    }

    private boolean pertenceAoUsuario(Pedido pedido, String usuarioId) {
        return pedido.getUsuario() != null && usuarioId.equals(pedido.getUsuario().getId());
    }

    // Só traz pedidos que ainda existem e são do dono da viagem
    private PedidosViagemResponse montarPedidos(Viagem viagem) {
        List<Pedido> pedidos = new ArrayList<>();
        if (viagem.getPedidoIds() != null && !viagem.getPedidoIds().isEmpty()) {
            pedidoRepository.findAllById(viagem.getPedidoIds()).forEach(p -> {
                if (pertenceAoUsuario(p, viagem.getUsuarioId())) {
                    pedidos.add(p);
                }
            });
        }
        pedidos.sort(Comparator.comparing(Pedido::getDataCadastro, Comparator.nullsLast(Comparator.reverseOrder())));

        BigDecimal valor = pedidos.stream().map(p -> Dinheiro.deDouble(p.getValorTotal()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal comissao = pedidos.stream().map(p -> Dinheiro.deDouble(p.getValorComissao()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return PedidosViagemResponse.builder()
                .pedidos(pedidos.stream().map(PedidoViagemResponse::from).collect(Collectors.toList()))
                .quantidadePedidos(pedidos.size())
                .valorTotalPedidos(valor.setScale(2))
                .valorTotalComissao(comissao.setScale(2))
                .build();
    }

    /** Também usado pelos serviços de despesas. */
    public Viagem obter(String usuarioId, String id) {
        return viagemRepository.findByIdAndUsuarioId(id, usuarioId).orElseThrow(this::naoEncontrada);
    }

    private RecursoNaoEncontradoException naoEncontrada() {
        return new RecursoNaoEncontradoException("Viagem não encontrada");
    }

    private ViagemResponse paraResposta(Viagem viagem) {
        List<Despesa> despesas = despesaRepository
                .findByViagemIdAndUsuarioIdOrderByDataDescCriadoEmDesc(viagem.getId(), viagem.getUsuarioId());
        return resposta(viagem, despesas);
    }

    private ViagemResponse resposta(Viagem viagem, List<Despesa> despesas) {
        long total = despesas.stream().mapToLong(Despesa::getValorCentavos).sum();
        int pedidos = viagem.getPedidoIds() != null ? viagem.getPedidoIds().size() : 0;
        return ViagemResponse.of(viagem, total, despesas.size(), pedidos);
    }

    private List<String> normalizarRoteiro(List<String> roteiro) {
        if (roteiro == null) {
            return new ArrayList<>();
        }
        return roteiro.stream()
                .filter(m -> m != null && !m.isBlank())
                .map(String::trim)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private String normalizarTexto(String texto) {
        return (texto == null || texto.isBlank()) ? null : texto.trim();
    }
}
