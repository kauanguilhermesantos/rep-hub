package com.rephub.services;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.rephub.dto.CategoriaResponse;
import com.rephub.dto.DespesaRequest;
import com.rephub.dto.DespesaResponse;
import com.rephub.dto.DespesasViagemResponse;
import com.rephub.dto.TotalCategoriaResponse;
import com.rephub.exceptions.RecursoNaoEncontradoException;
import com.rephub.models.Despesa;
import com.rephub.models.Viagem;
import com.rephub.repositories.DespesaRepository;
import com.rephub.util.Dinheiro;

import lombok.RequiredArgsConstructor;

/**
 * Despesas de uma viagem.
 //
 * Total: NÃO é persistido; é sempre somado a partir das despesas (em centavos, long) na
 * consulta. Assim incluir, editar ou excluir nunca deixa um total desatualizado.
 //
 * Categoria: a despesa guarda só o id da categoria (padrão ou personalizada do usuário); o nome
 * é resolvido na leitura. Despesas antigas (que já guardavam "COMBUSTIVEL" etc.) continuam válidas.
 * Regra de status (Dia 1): despesas podem ser criadas, editadas e excluídas em qualquer status
 * da viagem, inclusive FINALIZADA.
 //
 * Posse: a viagem é sempre buscada por (id, usuário autenticado) e a despesa por
 * (id, viagem, usuário). Recurso de outro usuário ou de outra viagem responde "não encontrado".
 */
@Service
@RequiredArgsConstructor
public class DespesaService {

    private final DespesaRepository despesaRepository;
    private final ViagemService viagemService;
    private final CategoriaDespesaService categoriaService;

    public DespesasViagemResponse listar(String usuarioId, String viagemId) {
        Viagem viagem = viagemService.obter(usuarioId, viagemId);
        List<Despesa> despesas = despesaRepository
                .findByViagemIdAndUsuarioIdOrderByDataDescCriadoEmDesc(viagem.getId(), usuarioId);
        Map<String, CategoriaResponse> categorias = categoriaService.mapa(usuarioId);

        long total = 0;
        Map<String, Long> porCategoria = new LinkedHashMap<>();
        for (Despesa d : despesas) {
            total += d.getValorCentavos();
            porCategoria.merge(d.getCategoria(), d.getValorCentavos(), Long::sum);
        }

        List<TotalCategoriaResponse> totais = porCategoria.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> {
                    CategoriaResponse c = categorias.get(e.getKey());
                    return TotalCategoriaResponse.builder()
                            .categoria(e.getKey())
                            .categoriaNome(c != null ? c.getNome() : "Categoria removida")
                            .padrao(c != null && c.isPadrao())
                            .total(Dinheiro.deCentavos(e.getValue()))
                            .build();
                })
                .collect(Collectors.toList());

        return DespesasViagemResponse.builder()
                .despesas(despesas.stream()
                        .map(d -> DespesaResponse.from(d, categorias.get(d.getCategoria())))
                        .collect(Collectors.toList()))
                .totalDespesas(Dinheiro.deCentavos(total))
                .totalPorCategoria(totais)
                .build();
    }

    public DespesaResponse buscar(String usuarioId, String viagemId, String despesaId) {
        viagemService.obter(usuarioId, viagemId);
        Despesa despesa = obterDespesa(usuarioId, viagemId, despesaId);
        return DespesaResponse.from(despesa, categoriaService.buscar(usuarioId, despesa.getCategoria()).orElse(null));
    }

    public DespesaResponse criar(String usuarioId, String viagemId, DespesaRequest request) {
        Viagem viagem = viagemService.obter(usuarioId, viagemId);
        CategoriaResponse categoria = exigirCategoria(usuarioId, request.getCategoria());
        LocalDateTime agora = LocalDateTime.now();

        Despesa despesa = new Despesa();
        despesa.setViagemId(viagem.getId());
        despesa.setUsuarioId(usuarioId);
        preencher(despesa, request);
        despesa.setCriadoEm(agora);
        despesa.setAtualizadoEm(agora);

        return DespesaResponse.from(despesaRepository.save(despesa), categoria);
    }

    public DespesaResponse atualizar(String usuarioId, String viagemId, String despesaId, DespesaRequest request) {
        viagemService.obter(usuarioId, viagemId);
        Despesa despesa = obterDespesa(usuarioId, viagemId, despesaId);

        CategoriaResponse categoria;
        if (request.getCategoria().equals(despesa.getCategoria())) {
            // Categoria inalterada: não bloqueia a edição de despesa antiga se a categoria sumiu
            categoria = categoriaService.buscar(usuarioId, request.getCategoria()).orElse(null);
        } else {
            categoria = exigirCategoria(usuarioId, request.getCategoria());
        }

        preencher(despesa, request); // viagemId, usuarioId e criadoEm nunca mudam
        despesa.setAtualizadoEm(LocalDateTime.now());

        return DespesaResponse.from(despesaRepository.save(despesa), categoria);
    }

    public void excluir(String usuarioId, String viagemId, String despesaId) {
        viagemService.obter(usuarioId, viagemId);
        despesaRepository.delete(obterDespesa(usuarioId, viagemId, despesaId));
    }

    private CategoriaResponse exigirCategoria(String usuarioId, String categoriaId) {
        return categoriaService.buscar(usuarioId, categoriaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada"));
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
