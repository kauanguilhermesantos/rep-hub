package com.rephub.services;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.bson.Document;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import com.rephub.dto.PaginaPedidosResponse;
import com.rephub.dto.ResumoPedidosResponse;
import com.rephub.models.Marca;
import com.rephub.models.Pedido;
import com.rephub.models.Usuario;
import com.rephub.repositories.MarcaRepository;
import com.rephub.repositories.PedidoRepository;
import com.rephub.repositories.UsuarioRepository;
import com.rephub.util.Dinheiro;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class PedidoService {
    private PedidoRepository pedidoRepository;
    private MarcaRepository marcaRepository;
    private UsuarioRepository usuarioRepository;
    private ViagemService viagemService;
    private MongoTemplate mongoTemplate;

    public static final int TAMANHO_MAXIMO_PAGINA = 10;

    /**
     * Uma página dos pedidos do usuário, do mais recente para o mais antigo. Dono, período e
     * busca são aplicados no MongoDB ANTES da paginação (skip/limit), então só a página
     * pedida é lida. A ordenação tem o id como desempate para que as páginas nunca repitam
     * nem omitam pedidos com a mesma data.
     *
     * - page: base 0 (negativo vira 0); size: limitado a TAMANHO_MAXIMO_PAGINA (10).
     * - busca: trecho do nome do cliente ou da marca (sem diferenciar maiúsculas).
     * - O resumo (totais) considera todos os pedidos do período, independentemente da busca.
     */
    public PaginaPedidosResponse listarPagina(String usuarioId, LocalDateTime inicio, LocalDateTime fim,
                                              String busca, int page, int size) {
        int tamanho = Math.min(Math.max(size, 1), TAMANHO_MAXIMO_PAGINA);
        int pagina = Math.max(page, 0);

        Criteria doPeriodo = criteriosDoPeriodo(usuarioId, inicio, fim);
        Criteria filtrados = comBusca(doPeriodo, usuarioId, busca);

        long total = mongoTemplate.count(new Query(filtrados), Pedido.class);

        Sort ordem = Sort.by(Sort.Direction.DESC, "dataCadastro").and(Sort.by(Sort.Direction.DESC, "id"));
        List<Pedido> pedidos = mongoTemplate.find(
                new Query(filtrados).with(PageRequest.of(pagina, tamanho, ordem)), Pedido.class);

        int totalPaginas = (int) ((total + tamanho - 1) / tamanho);

        return PaginaPedidosResponse.builder()
                .content(enriquecer(pedidos))
                .page(pagina)
                .size(tamanho)
                .totalElements(total)
                .totalPages(totalPaginas)
                .first(pagina == 0)
                .last(pagina >= totalPaginas - 1)
                .resumo(resumir(doPeriodo))
                .build();
    }

    // Dono do pedido + período (o período só vale se início e fim forem informados)
    private Criteria criteriosDoPeriodo(String usuarioId, LocalDateTime inicio, LocalDateTime fim) {
        Criteria criterios = Criteria.where("usuario.id").is(usuarioId);
        if (inicio != null && fim != null) {
            criterios = criterios.and("dataCadastro").gte(inicio).lte(fim);
        }
        return criterios;
    }

    // Cliente OU marca. A marca é procurada pelo nome ATUAL (o nome copiado dentro do pedido
    // pode estar desatualizado se a marca foi renomeada) e o pedido é achado pelo id dela.
    private Criteria comBusca(Criteria doPeriodo, String usuarioId, String busca) {
        String termo = busca == null ? "" : busca.trim();
        if (termo.isEmpty()) {
            return doPeriodo;
        }

        Pattern padrao = Pattern.compile(Pattern.quote(termo), Pattern.CASE_INSENSITIVE);
        List<String> marcaIds = marcaRepository.findByUsuario_IdAndNomeContainingIgnoreCase(usuarioId, termo).stream()
                .map(Marca::getId)
                .collect(Collectors.toList());

        return new Criteria().andOperator(
                doPeriodo,
                new Criteria().orOperator(
                        Criteria.where("cliente").regex(padrao),
                        Criteria.where("marca.id").in(marcaIds)));
    }

    // Totais calculados pelo MongoDB (agregação), sem trazer os pedidos para a memória
    private ResumoPedidosResponse resumir(Criteria doPeriodo) {
        Aggregation agregacao = Aggregation.newAggregation(
                Aggregation.match(doPeriodo),
                Aggregation.group()
                        .count().as("totalPedidos")
                        .sum("quantPares").as("totalPares")
                        .sum("valorTotal").as("valorTotal")
                        .sum("valorComissao").as("valorComissao"));

        Document r = mongoTemplate.aggregate(agregacao, Pedido.class, Document.class).getUniqueMappedResult();

        return ResumoPedidosResponse.builder()
                .totalPedidos(numero(r, "totalPedidos").longValue())
                .totalPares(numero(r, "totalPares").longValue())
                .valorTotalVendas(Dinheiro.deDouble(numero(r, "valorTotal").doubleValue()))
                .valorTotalComissao(Dinheiro.deDouble(numero(r, "valorComissao").doubleValue()))
                .build();
    }

    private Number numero(Document documento, String campo) {
        Object valor = documento == null ? null : documento.get(campo);
        return valor instanceof Number n ? n : Integer.valueOf(0);
    }

    // Retorna os "limite" pedidos mais recentes do usuário, já ordenados pelo backend
    public List<Pedido> getPedidosRecentes(String usuarioId, int limite) {
        Pageable pageable = PageRequest.of(0, limite);
        return enriquecer(pedidoRepository.findByUsuario_IdOrderByDataCadastroDesc(usuarioId, pageable));
    }

    // Completa usuário e marca (resumida) de cada pedido com UMA consulta por tipo,
    // em vez de duas consultas por pedido.
    private List<Pedido> enriquecer(List<Pedido> pedidos) {
        Set<String> usuarioIds = new HashSet<>();
        Set<String> marcaIds = new HashSet<>();
        for (Pedido pedido : pedidos) {
            if (pedido.getUsuario() != null && pedido.getUsuario().getId() != null) {
                usuarioIds.add(pedido.getUsuario().getId());
            }
            if (pedido.getMarca() != null && pedido.getMarca().getId() != null) {
                marcaIds.add(pedido.getMarca().getId());
            }
        }

        Map<String, Usuario> usuarios = new HashMap<>();
        if (!usuarioIds.isEmpty()) {
            usuarioRepository.findAllById(usuarioIds).forEach(u -> usuarios.put(u.getId(), u));
        }
        Map<String, Marca> marcas = new HashMap<>();
        if (!marcaIds.isEmpty()) {
            marcaRepository.findAllById(marcaIds).forEach(m -> marcas.put(m.getId(), m));
        }

        for (Pedido pedido : pedidos) {
            if (pedido.getUsuario() != null && pedido.getUsuario().getId() != null) {
                pedido.setUsuario(usuarios.get(pedido.getUsuario().getId()));
            }

            if (pedido.getMarca() != null && pedido.getMarca().getId() != null) {
                Marca marca = marcas.get(pedido.getMarca().getId());
                if (marca != null) {
                    Marca marcaResumida = new Marca();
                    marcaResumida.setId(marca.getId());
                    marcaResumida.setNome(marca.getNome());
                    pedido.setMarca(marcaResumida);
                } else {
                    pedido.setMarca(null);
                }
            }
        }

        return pedidos;
    }

    public Pedido findById(String id) {
        return pedidoRepository.findById(id).orElse(null);
    }

    public Pedido createPedido(Pedido pedido) {
        if (pedido.getUsuario() != null && pedido.getUsuario().getId() != null) {
            Usuario usuario = usuarioRepository.findById(pedido.getUsuario().getId()).orElse(null);
            pedido.setUsuario(usuario);
        }

        if (pedido.getMarca() != null && pedido.getMarca().getId() != null) {
            String donoId = pedido.getUsuario() != null ? pedido.getUsuario().getId() : null;
            Marca marca = marcaRepository.findById(pedido.getMarca().getId())
                    .filter(m -> donoId != null && m.getUsuario() != null && donoId.equals(m.getUsuario().getId()))
                    .orElseThrow(() -> new RuntimeException("Marca não encontrada!"));
            pedido.setMarca(marca);
        }

        if (pedido.getDataCadastro() == null) {
            pedido.setDataCadastro(LocalDateTime.now());
        }

        return pedidoRepository.save(pedido);
    }

    public Pedido updatePedido(Pedido pedido) {
        if (pedido == null || pedido.getId() == null) {
            return null;
        }

        Pedido existingPedido = findById(pedido.getId());
        if (existingPedido == null) {
            return null;
        }

        if (pedido.getMarca() != null && pedido.getMarca().getId() != null) {
            String donoId = existingPedido.getUsuario() != null ? existingPedido.getUsuario().getId() : null;
            Marca marca = marcaRepository.findById(pedido.getMarca().getId())
                    .filter(m -> donoId != null && m.getUsuario() != null && donoId.equals(m.getUsuario().getId()))
                    .orElseThrow(() -> new RuntimeException("Marca não encontrada!"));
            existingPedido.setMarca(marca);
        }

        if (pedido.getCliente() != null) {
            existingPedido.setCliente(pedido.getCliente());
        }

        if (pedido.getQuantPares() != null) {
            existingPedido.setQuantPares(pedido.getQuantPares());
        }

        if (pedido.getValorTotal() != null) {
            existingPedido.setValorTotal(pedido.getValorTotal());
        }

        if (pedido.getComissaoPercentual() != null) {
            existingPedido.setComissaoPercentual(pedido.getComissaoPercentual());
        }

        if (pedido.getValorComissao() != null) {
            existingPedido.setValorComissao(pedido.getValorComissao());
        }

        if (pedido.getCondicaoPagamento() != null) {
            existingPedido.setCondicaoPagamento(pedido.getCondicaoPagamento());
        }

        if (pedido.getEstado() != null) {
            existingPedido.setEstado(pedido.getEstado());
        }

        if (pedido.getCidade() != null) {
            existingPedido.setCidade(pedido.getCidade());
        }

        if (pedido.getAnexoUrl() != null) {
            existingPedido.setAnexoUrl(pedido.getAnexoUrl());
        }

        return pedidoRepository.save(existingPedido);
    }

    public Pedido deletePedido(String id) {
        Pedido pedido = findById(id);
        if (pedido == null) {
            return null;
        }
        pedidoRepository.deleteById(id);
        // Remove a referência de qualquer viagem (a viagem guarda só o id do pedido)
        viagemService.desassociarPedidoExcluido(id);
        return pedido;
    }
}