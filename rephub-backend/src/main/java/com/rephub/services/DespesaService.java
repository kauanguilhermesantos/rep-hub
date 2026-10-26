package com.rephub.services;

import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.math.BigDecimal;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.rephub.dto.DespesaRequest;
import com.rephub.dto.DespesaResponse;
import com.rephub.dto.DespesasViagemResponse;
import com.rephub.exceptions.RecursoNaoEncontradoException;
import com.rephub.models.CategoriaDespesa;
import com.rephub.models.Despesa;
import com.rephub.models.Viagem;
import com.rephub.repositories.DespesaRepository;
import com.rephub.util.Dinheiro;

import lombok.RequiredArgsConstructor;

/**
 * Despesas de uma viagem.
 *
 * Total: NÃO é persistido; é sempre somado a partir das despesas (em centavos, long) na
 * consulta. Assim incluir, editar ou excluir nunca deixa um total desatualizado.
 *
 * Regra de status (Dia 1): despesas podem ser criadas, editadas e excluídas em qualquer
 * status da viagem, inclusive FINALIZADA.
 *
 * Posse: a viagem é sempre buscada por (id, usuário autenticado) e a despesa por
 * (id, viagem, usuário). Recurso de outro usuário ou de outra viagem responde "não encontrado".
 */
@Service
@RequiredArgsConstructor
public class DespesaService {

    private final DespesaRepository despesaRepository;
    private final ViagemService viagemService;

    public DespesasViagemResponse listar(String usuarioId, String viagemId) {
        Viagem viagem = viagemService.obter(usuarioId, viagemId);
        List<Despesa> despesas = despesaRepository
                .findByViagemIdAndUsuarioIdOrderByDataDescCriadoEmDesc(viagem.getId(), usuarioId);

        long total = 0;
        Map<CategoriaDespesa, Long> porCategoria = new EnumMap<>(CategoriaDespesa.class);
        for (Despesa d : despesas) {
            total += d.getValorCentavos();
            porCategoria.merge(d.getCategoria(), d.getValorCentavos(), Long::sum);
        }
        Map<CategoriaDespesa, BigDecimal> totais = new LinkedHashMap<>();
        porCategoria.forEach((c, v) -> totais.put(c, Dinheiro.deCentavos(v)));

        return DespesasViagemResponse.builder()
                .despesas(despesas.stream().map(DespesaResponse::from).collect(Collectors.toList()))
                .totalDespesas(Dinheiro.deCentavos(total))
                .totalPorCategoria(totais)
                .build();
    }

    public DespesaResponse buscar(String usuarioId, String viagemId, String despesaId) {
        viagemService.obter(usuarioId, viagemId);
        return DespesaResponse.from(obterDespesa(usuarioId, viagemId, despesaId));
    }

    public DespesaResponse criar(String usuarioId, String viagemId, DespesaRequest request) {
        Viagem viagem = viagemService.obter(usuarioId, viagemId);
        LocalDateTime agora = LocalDateTime.now();

        Despesa despesa = new Despesa();
        despesa.setViagemId(viagem.getId());
        despesa.setUsuarioId(usuarioId);
        preencher(despesa, request);
        despesa.setCriadoEm(agora);
        despesa.setAtualizadoEm(agora);

        return DespesaResponse.from(despesaRepository.save(despesa));
    }

    public DespesaResponse atualizar(String usuarioId, String viagemId, String despesaId, DespesaRequest request) {
        viagemService.obter(usuarioId, viagemId);
        Despesa despesa = obterDespesa(usuarioId, viagemId, despesaId);

        preencher(despesa, request); // viagemId, usuarioId e criadoEm nunca mudam
        despesa.setAtualizadoEm(LocalDateTime.now());

        return DespesaResponse.from(despesaRepository.save(despesa));
    }

    public void excluir(String usuarioId, String viagemId, String despesaId) {
        viagemService.obter(usuarioId, viagemId);
        despesaRepository.delete(obterDespesa(usuarioId, viagemId, despesaId));
    }

    private Despesa obterDespesa(String usuarioId, String viagemId, String despesaId) {
        return despesaRepository.findByIdAndViagemIdAndUsuarioId(despesaId, viagemId, usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Despesa não encontrada"));
    }

    private void preencher(Despesa despesa, DespesaRequest request) {
        despesa.setCategoria(request.getCategoria());
        despesa.setDescricao(request.getDescricao().trim());
        despesa.setValorCentavos(Dinheiro.aCentavos(request.getValor()));
        despesa.setData(request.getData());
        String obs = request.getObservacoes();
        despesa.setObservacoes(obs == null || obs.isBlank() ? null : obs.trim());
    }
}
