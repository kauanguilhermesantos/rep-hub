package com.rephub.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import com.rephub.dto.ViagemRequest;
import com.rephub.dto.ViagemResponse;
import com.rephub.exceptions.RecursoNaoEncontradoException;
import com.rephub.exceptions.RegraNegocioException;
import com.rephub.models.Despesa;
import com.rephub.models.StatusViagem;
import com.rephub.models.Viagem;
import com.rephub.repositories.DespesaRepository;
import com.rephub.repositories.ViagemRepository;

import lombok.RequiredArgsConstructor;

/**
 * Cadastro, consulta e edição de viagens. Toda operação recebe o id do usuário
 * autenticado (nunca vindo do corpo) e só enxerga viagens dele: a de outro usuário
 * responde como "não encontrada".
 *
 * Regras de status (Dia 1): os dados gerais podem ser editados em qualquer status;
 * status e data de finalização jamais são alterados aqui (só pelo endpoint de finalizar).
 */
@Service
@RequiredArgsConstructor
public class ViagemService {

    private final ViagemRepository viagemRepository;
    private final DespesaRepository despesaRepository;
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

        Viagem nova = mongoTemplate.findAndModify(
                new Query(Criteria.where("id").is(id).and("usuarioId").is(usuarioId)),
                update, FindAndModifyOptions.options().returnNew(true), Viagem.class);
        if (nova == null) {
            throw naoEncontrada();
        }
        return paraResposta(nova);
    }

    /** Também usado pelos serviços de despesas e pedidos nos próximos dias. */
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
