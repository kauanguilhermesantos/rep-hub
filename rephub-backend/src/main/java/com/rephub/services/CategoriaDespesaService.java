package com.rephub.services;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import com.rephub.dto.CategoriaRequest;
import com.rephub.dto.CategoriaResponse;
import com.rephub.exceptions.RecursoNaoEncontradoException;
import com.rephub.exceptions.RegraNegocioException;
import com.rephub.models.CategoriaDespesa;
import com.rephub.models.CategoriaPersonalizada;
import com.rephub.repositories.CategoriaPersonalizadaRepository;
import com.rephub.repositories.DespesaRepository;

import lombok.RequiredArgsConstructor;

/**
 * Categorias de despesa: as 6 padrão (constantes, iguais para todos) + as personalizadas
 * de cada representante.
 //
 * Isolamento: toda busca de categoria personalizada é por (id, usuário autenticado).
 * Integridade: categoria com despesas vinculadas NÃO pode ser excluída (o histórico mantém o
 * vínculo e o nome); renomear mantém o id, então as despesas acompanham o novo nome.
 */
@Service
@RequiredArgsConstructor
public class CategoriaDespesaService {

    private final CategoriaPersonalizadaRepository categoriaRepository;
    private final DespesaRepository despesaRepository;

    /** Padrão (na ordem fixa) seguidas das personalizadas do usuário em ordem alfabética. */
    public List<CategoriaResponse> listar(String usuarioId) {
        List<CategoriaResponse> todas = new ArrayList<>();
        for (CategoriaDespesa c : CategoriaDespesa.values()) {
            todas.add(CategoriaResponse.padrao(c));
        }
        categoriaRepository.findByUsuarioId(usuarioId).stream()
                .sorted(Comparator.comparing(CategoriaPersonalizada::getNomeNormalizado))
                .map(CategoriaResponse::personalizada)
                .forEach(todas::add);
        return todas;
    }

    /** Todas as categorias do usuário indexadas por id (uma única consulta), para montar respostas. */
    public Map<String, CategoriaResponse> mapa(String usuarioId) {
        Map<String, CategoriaResponse> mapa = new LinkedHashMap<>();
        listar(usuarioId).forEach(c -> mapa.put(c.getId(), c));
        return mapa;
    }

    /** Categoria padrão ou personalizada DESTE usuário; vazio se não existir ou for de outro. */
    public Optional<CategoriaResponse> buscar(String usuarioId, String categoriaId) {
        if (categoriaId == null || categoriaId.isBlank()) {
            return Optional.empty();
        }
        Optional<CategoriaDespesa> padrao = padraoPorId(categoriaId);
        if (padrao.isPresent()) {
            return padrao.map(CategoriaResponse::padrao);
        }
        return categoriaRepository.findByIdAndUsuarioId(categoriaId, usuarioId)
                .map(CategoriaResponse::personalizada);
    }

    public CategoriaResponse criar(String usuarioId, CategoriaRequest request) {
        String nome = limparNome(request.getNome());
        String normalizado = normalizar(nome);
        garantirNomeDisponivel(usuarioId, normalizado, null);

        LocalDateTime agora = LocalDateTime.now();
        CategoriaPersonalizada categoria = new CategoriaPersonalizada();
        categoria.setUsuarioId(usuarioId);
        categoria.setNome(nome);
        categoria.setNomeNormalizado(normalizado);
        categoria.setCriadoEm(agora);
        categoria.setAtualizadoEm(agora);
        return CategoriaResponse.personalizada(salvar(categoria));
    }

    public CategoriaResponse atualizar(String usuarioId, String categoriaId, CategoriaRequest request) {
        exigirPersonalizada(categoriaId, "editadas");
        CategoriaPersonalizada categoria = obterPersonalizada(usuarioId, categoriaId);

        String nome = limparNome(request.getNome());
        String normalizado = normalizar(nome);
        garantirNomeDisponivel(usuarioId, normalizado, categoria.getId());

        categoria.setNome(nome);
        categoria.setNomeNormalizado(normalizado);
        categoria.setAtualizadoEm(LocalDateTime.now());
        return CategoriaResponse.personalizada(salvar(categoria));
    }

    public void excluir(String usuarioId, String categoriaId) {
        exigirPersonalizada(categoriaId, "excluídas");
        CategoriaPersonalizada categoria = obterPersonalizada(usuarioId, categoriaId);

        long emUso = despesaRepository.countByUsuarioIdAndCategoria(usuarioId, categoria.getId());
        if (emUso > 0) {
            throw new RegraNegocioException(String.format(
                    "Não é possível excluir a categoria \"%s\": %d %s usa%s essa categoria. "
                            + "Altere a categoria dessas despesas antes de excluí-la.",
                    categoria.getNome(), emUso, emUso == 1 ? "despesa" : "despesas", emUso == 1 ? "" : "m"));
        }
        categoriaRepository.delete(categoria);
    }

    // ---------------------------------------------------------------- apoio

    private Optional<CategoriaDespesa> padraoPorId(String id) {
        try {
            return Optional.of(CategoriaDespesa.valueOf(id));
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    private void exigirPersonalizada(String categoriaId, String acao) {
        if (padraoPorId(categoriaId).isPresent()) {
            throw new RegraNegocioException("As categorias padrão não podem ser " + acao);
        }
    }

    private CategoriaPersonalizada obterPersonalizada(String usuarioId, String categoriaId) {
        return categoriaRepository.findByIdAndUsuarioId(categoriaId, usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada"));
    }

    private void garantirNomeDisponivel(String usuarioId, String normalizado, String idIgnorado) {
        for (CategoriaDespesa padrao : CategoriaDespesa.values()) {
            if (normalizar(padrao.getNome()).equals(normalizado)) {
                throw new RegraNegocioException("Já existe uma categoria padrão com esse nome");
            }
        }
        Optional<CategoriaPersonalizada> existente =
                categoriaRepository.findByUsuarioIdAndNomeNormalizado(usuarioId, normalizado);
        if (existente.isPresent() && !existente.get().getId().equals(idIgnorado)) {
            throw new RegraNegocioException("Você já tem uma categoria com esse nome");
        }
    }

    private CategoriaPersonalizada salvar(CategoriaPersonalizada categoria) {
        try {
            return categoriaRepository.save(categoria);
        } catch (DuplicateKeyException e) {
            // Duas requisições simultâneas com o mesmo nome: o índice único barra a segunda
            throw new RegraNegocioException("Você já tem uma categoria com esse nome");
        }
    }

    /** Remove espaços das pontas e colapsa espaços internos, mantendo maiúsculas/acentos digitados. */
    static String limparNome(String nome) {
        String limpo = nome == null ? "" : nome.trim().replaceAll("\\s+", " ");
        if (limpo.isEmpty()) {
            throw new RegraNegocioException("O nome da categoria é obrigatório");
        }
        return limpo;
    }

    /** Chave de comparação: sem acentos, minúsculas, espaços colapsados ("  Pedágio " == "pedagio"). */
    static String normalizar(String nome) {
        String semAcento = Normalizer.normalize(nome, Normalizer.Form.NFD).replaceAll("\\p{M}+", "");
        return semAcento.trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
    }
}
