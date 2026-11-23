package com.rephub.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.rephub.dto.PaginaPrepostosResponse;
import com.rephub.dto.PrepostoRequest;
import com.rephub.dto.PrepostoResponse;
import com.rephub.exceptions.CampoInvalidoException;
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
                .orElseThrow(PrepostoService::naoEncontrado);
    }

    public PrepostoResponse criar(String usuarioId, PrepostoRequest request) {
        validarDatas(request);
        LocalDateTime agora = LocalDateTime.now();

        Preposto preposto = new Preposto();
        preposto.setUsuarioId(usuarioId);
        preposto.setNome(request.getNome().trim());
        preposto.setContato(normalizarTexto(request.getContato()));
        preposto.setComissaoPercentualPadrao(request.getComissaoPercentualPadrao());
        preposto.setDataInicio(request.getDataInicio());
        preposto.setDataFim(request.getDataFim());
        preposto.setAtivo(request.getDataFim() == null); // já cadastrado com data de fim = encerrado
        preposto.setCriadoEm(agora);
        preposto.setAtualizadoEm(agora);

        return PrepostoResponse.from(prepostoRepository.save(preposto));
    }

    /**
     * $set só dos campos cadastrais, filtrando por id + dono numa única operação: dono, ativo e
     * criadoEm nunca são tocados, e uma inativação concorrente não é desfeita.
     */
    public PrepostoResponse editar(String usuarioId, String id, PrepostoRequest request) {
        validarDatas(request);

        Update update = new Update()
                .set("nome", request.getNome().trim())
                .set("contato", normalizarTexto(request.getContato()))
                .set("comissaoPercentualPadrao", request.getComissaoPercentualPadrao())
                .set("dataInicio", request.getDataInicio())
                .set("dataFim", request.getDataFim())
                .set("atualizadoEm", LocalDateTime.now());

        Preposto atualizado = mongoTemplate.findAndModify(
                new Query(Criteria.where("id").is(id).and("usuarioId").is(usuarioId)),
                update, FindAndModifyOptions.options().returnNew(true), Preposto.class);
        if (atualizado == null) {
            throw naoEncontrado();
        }
        return PrepostoResponse.from(atualizado);
    }

    private static void validarDatas(PrepostoRequest request) {
        if (request.getDataFim() != null && request.getDataFim().isBefore(request.getDataInicio())) {
            throw new CampoInvalidoException("dataFim", "A data de fim não pode ser anterior à data de início");
        }
    }

    private static String normalizarTexto(String texto) {
        return (texto == null || texto.isBlank()) ? null : texto.trim();
    }

    private static RecursoNaoEncontradoException naoEncontrado() {
        return new RecursoNaoEncontradoException("Preposto não encontrado");
    }

    private static ResponseStatusException badRequest(String mensagem) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagem);
    }
}
