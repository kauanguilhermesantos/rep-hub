package com.rephub.services;

import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.rephub.dto.PaginaPrepostosResponse;
import com.rephub.dto.PrepostoResponse;
import com.rephub.exceptions.RecursoNaoEncontradoException;
import com.rephub.models.Preposto;
import com.rephub.repositories.PrepostoRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class PrepostoService {

    public static final int TAMANHO_MAXIMO_PAGINA = 100;
    private static final Set<String> ORDENACOES_PERMITIDAS = Set.of("nome", "dataInicio");

    private PrepostoRepository prepostoRepository;
    private MongoTemplate mongoTemplate;

    /**
     * Uma página dos prepostos do usuário. Dono, situação e busca são aplicados no MongoDB
     * antes do skip/limit (usa o índice {usuarioId, ativo}); só a página pedida é lida.
     * O id desempata a ordenação para as páginas não repetirem nem pularem registros.
     *
     * - situacao: ativos | inativos | todos
     * - busca: trecho do nome, sem diferenciar maiúsculas (texto escapado, nunca vira regex)
     * - ordenarPor: nome | dataInicio; direcao: asc | desc
     */
    public PaginaPrepostosResponse listar(String usuarioId, String situacao, String busca,
                                          int page, int size, String ordenarPor, String direcao) {
        if (page < 0) {
            throw badRequest("page deve ser maior ou igual a 0");
        }
        if (size < 1 || size > TAMANHO_MAXIMO_PAGINA) {
            throw badRequest("size deve estar entre 1 e " + TAMANHO_MAXIMO_PAGINA);
        }
        if (!ORDENACOES_PERMITIDAS.contains(ordenarPor)) {
            throw badRequest("ordenarPor deve ser nome ou dataInicio");
        }
        Sort.Direction sentido = switch (direcao.toLowerCase()) {
            case "asc" -> Sort.Direction.ASC;
            case "desc" -> Sort.Direction.DESC;
            default -> throw badRequest("direcao deve ser asc ou desc");
        };

        Criteria criterios = Criteria.where("usuarioId").is(usuarioId);
        switch (situacao.toLowerCase()) {
            case "ativos" -> criterios = criterios.and("ativo").is(true);
            case "inativos" -> criterios = criterios.and("ativo").is(false);
            case "todos" -> { }
            default -> throw badRequest("situacao deve ser ativos, inativos ou todos");
        }
        String termo = busca == null ? "" : busca.trim();
        if (!termo.isEmpty()) {
            criterios = criterios.and("nome").regex(Pattern.compile(Pattern.quote(termo), Pattern.CASE_INSENSITIVE));
        }

        long total = mongoTemplate.count(new Query(criterios), Preposto.class);

        Sort ordem = Sort.by(sentido, ordenarPor).and(Sort.by(Sort.Direction.ASC, "id"));
        List<PrepostoResponse> conteudo = mongoTemplate
                .find(new Query(criterios).with(PageRequest.of(page, size, ordem)), Preposto.class)
                .stream().map(PrepostoResponse::from).toList();

        int totalPaginas = (int) ((total + size - 1) / size);

        return PaginaPrepostosResponse.builder()
                .content(conteudo)
                .page(page)
                .size(size)
                .totalElements(total)
                .totalPages(totalPaginas)
                .first(page == 0)
                .last(page >= totalPaginas - 1)
                .build();
    }

    // Id e dono na mesma consulta: de outro usuário ou inexistente dá o mesmo 404
    public PrepostoResponse buscar(String usuarioId, String id) {
        return prepostoRepository.findByIdAndUsuarioId(id, usuarioId)
                .map(PrepostoResponse::from)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Preposto não encontrado"));
    }

    private static ResponseStatusException badRequest(String mensagem) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagem);
    }
}
