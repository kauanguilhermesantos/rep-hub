package com.rephub.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import com.rephub.dto.CategoriaResponse;
import com.rephub.dto.DashboardRelatorioResponse;
import com.rephub.dto.DashboardRelatorioResponse.MarcaDesempenho;
import com.rephub.dto.DashboardRelatorioResponse.MarcaMensal;
import com.rephub.dto.DashboardRelatorioResponse.PontoMensal;
import com.rephub.dto.DashboardRelatorioResponse.PontoViagemMensal;
import com.rephub.dto.DashboardRelatorioResponse.ResumoComercial;
import com.rephub.dto.DashboardRelatorioResponse.ResumoViagens;
import com.rephub.dto.TotalCategoriaResponse;
import com.rephub.dto.ViagemResponse;
import com.rephub.exceptions.RecursoNaoEncontradoException;
import com.rephub.exceptions.RegraNegocioException;
import com.rephub.models.Despesa;
import com.rephub.models.Marca;
import com.rephub.models.StatusViagem;
import com.rephub.repositories.DespesaRepository;
import com.rephub.repositories.MarcaRepository;
import com.rephub.util.Dinheiro;

import lombok.RequiredArgsConstructor;

/**
 * Dashboard de relatórios (comercial + viagens).
 //
 * Pedidos: UMA agregação no MongoDB (agrupa por mês e marca). Resumo, evolução mensal e
 * desempenho por marca são derivados das mesmas linhas, então nunca divergem entre si.
 * Viagens: reutiliza ViagemService.listar, a única fonte das regras de total de despesas,
 * vendas e resultado — nada é recalculado por outra regra aqui.
 * Posse: pedidos filtrados por usuario._id; marca filtrada precisa pertencer ao usuário.
 */
@Service
@RequiredArgsConstructor
public class DashboardRelatorioService {

    static final ZoneId ZONA = ZoneId.of("America/Sao_Paulo");
    static final String SEM_MARCA = "sem-marca";
    static final String SEM_DATA = "sem-data";

    private final MongoTemplate mongoTemplate;
    private final MarcaRepository marcaRepository;
    private final ViagemService viagemService;
    private final DespesaRepository despesaRepository;
    private final CategoriaDespesaService categoriaService;

    /** Uma linha da agregação: pedidos de uma marca em um mês. */
    record LinhaPedido(String mes, String marcaId, int pedidos, long pares, BigDecimal vendas, BigDecimal comissao) {
    }

    public DashboardRelatorioResponse gerar(String usuarioId, LocalDate inicio, LocalDate fim,
                                            String marcaId, StatusViagem status) {
        if (inicio != null && fim != null && inicio.isAfter(fim)) {
            throw new RegraNegocioException("A data inicial não pode ser posterior à data final");
        }

        String marcaFiltro = (marcaId == null || marcaId.isBlank()) ? null : marcaId.trim();
        List<Marca> marcasDoUsuario = marcaRepository.findByUsuario_Id(usuarioId);
        if (marcaFiltro != null && marcasDoUsuario.stream().noneMatch(m -> marcaFiltro.equals(m.getId()))) {
            throw new RecursoNaoEncontradoException("Marca não encontrada");
        }
        // Nomes atuais das marcas (o nome embutido no pedido pode estar desatualizado)
        Map<String, String> nomes = new HashMap<>();
        for (Marca m : marcasDoUsuario) {
            nomes.put(m.getId(), m.getNome() == null ? "Sem nome" : m.getNome());
        }

        List<LinhaPedido> linhas = buscarLinhas(usuarioId, inicio, fim, marcaFiltro);
        List<ViagemResponse> viagens = viagemService.listar(usuarioId, status, inicio, fim);

        return DashboardRelatorioResponse.builder()
                .comercial(resumoComercial(linhas, marcasDoUsuario.size()))
                .vendasPorMes(vendasPorMes(linhas))
                .marcas(desempenhoMarcas(linhas, nomes))
                .marcasPorMes(marcasPorMes(linhas, nomes))
                .viagens(resumoViagens(viagens))
                .viagensPorMes(viagensPorMes(viagens))
                .despesasPorCategoria(despesasPorCategoria(usuarioId, viagens))
                .viagensIgnoramMarca(marcaFiltro != null)
                .build();
    }

    // agregação no MongoDB

    private List<LinhaPedido> buscarLinhas(String usuarioId, LocalDate inicio, LocalDate fim, String marcaId) {
        Document match = new Document("usuario._id", new Document("$in", idsPossiveis(usuarioId)));
        if (marcaId != null) {
            match.append("marca._id", new Document("$in", idsPossiveis(marcaId)));
        }
        Document periodo = new Document();
        if (inicio != null) {
            periodo.append("$gte", paraData(inicio.atStartOfDay()));
        }
        if (fim != null) {
            periodo.append("$lte", paraData(fim.atTime(LocalTime.MAX)));
        }
        if (!periodo.isEmpty()) {
            match.append("dataCadastro", periodo);
        }

        Document mes = new Document("$dateToString", new Document("format", "%Y-%m")
                .append("date", "$dataCadastro")
                .append("timezone", ZONA.getId()));
        Document group = new Document("_id", new Document("mes", mes).append("marca", "$marca._id"))
                .append("pedidos", new Document("$sum", 1))
                .append("pares", new Document("$sum", "$quantPares"))
                .append("vendas", new Document("$sum", "$valorTotal"))
                .append("comissao", new Document("$sum", "$valorComissao"));

        List<Document> pipeline = List.of(new Document("$match", match), new Document("$group", group));

        List<LinhaPedido> linhas = new ArrayList<>();
        for (Document d : mongoTemplate.getCollection("pedidos").aggregate(pipeline)) {
            Document id = d.get("_id", Document.class);
            Object marca = id.get("marca");
            String mesLinha = id.getString("mes");
            linhas.add(new LinhaPedido(
                    mesLinha == null ? SEM_DATA : mesLinha,
                    marca == null ? SEM_MARCA : marca.toString(),
                    numero(d.get("pedidos")).intValue(),
                    numero(d.get("pares")).longValue(),
                    Dinheiro.deDouble(numero(d.get("vendas")).doubleValue()),
                    Dinheiro.deDouble(numero(d.get("comissao")).doubleValue())));
        }
        return linhas;
    }

    // O id pode estar gravado como ObjectId ou como texto: aceita os dois
    private static List<Object> idsPossiveis(String id) {
        List<Object> ids = new ArrayList<>();
        ids.add(id);
        if (ObjectId.isValid(id)) {
            ids.add(new ObjectId(id));
        }
        return ids;
    }

    private static Date paraData(LocalDateTime dataHora) {
        return Date.from(dataHora.atZone(ZONA).toInstant());
    }

    private static Number numero(Object valor) {
        return valor instanceof Number n ? n : 0;
    }

    // consolidação (pura, testável)

    static ResumoComercial resumoComercial(List<LinhaPedido> linhas, int marcasCadastradas) {
        int pedidos = linhas.stream().mapToInt(LinhaPedido::pedidos).sum();
        BigDecimal vendas = soma(linhas, LinhaPedido::vendas);
        int marcasAtivas = (int) linhas.stream().map(LinhaPedido::marcaId).distinct().count();
        return ResumoComercial.builder()
                .totalPedidos(pedidos)
                .totalPares(linhas.stream().mapToLong(LinhaPedido::pares).sum())
                .totalVendas(vendas)
                .totalComissao(soma(linhas, LinhaPedido::comissao))
                .ticketMedio(media(vendas, pedidos))
                .quantidadeMarcas(marcasAtivas)
                .quantidadeMarcasCadastradas(marcasCadastradas)
                .build();
    }

    static List<PontoMensal> vendasPorMes(List<LinhaPedido> linhas) {
        Map<String, List<LinhaPedido>> porMes = linhas.stream()
                .collect(Collectors.groupingBy(LinhaPedido::mes, TreeMap::new, Collectors.toList()));
        List<PontoMensal> pontos = new ArrayList<>();
        porMes.forEach((mes, grupo) -> pontos.add(PontoMensal.builder()
                .mes(mes)
                .pedidos(grupo.stream().mapToInt(LinhaPedido::pedidos).sum())
                .pares(grupo.stream().mapToLong(LinhaPedido::pares).sum())
                .vendas(soma(grupo, LinhaPedido::vendas))
                .comissao(soma(grupo, LinhaPedido::comissao))
                .build()));
        return pontos;
    }

    static List<MarcaDesempenho> desempenhoMarcas(List<LinhaPedido> linhas, Map<String, String> nomes) {
        BigDecimal totalVendas = soma(linhas, LinhaPedido::vendas);
        Map<String, List<LinhaPedido>> porMarca = linhas.stream()
                .collect(Collectors.groupingBy(LinhaPedido::marcaId, LinkedHashMap::new, Collectors.toList()));
        List<MarcaDesempenho> marcas = new ArrayList<>();
        porMarca.forEach((marcaId, grupo) -> {
            int pedidos = grupo.stream().mapToInt(LinhaPedido::pedidos).sum();
            BigDecimal vendas = soma(grupo, LinhaPedido::vendas);
            BigDecimal participacao = totalVendas.signum() > 0
                    ? vendas.multiply(BigDecimal.valueOf(100)).divide(totalVendas, 1, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO.setScale(1);
            marcas.add(MarcaDesempenho.builder()
                    .marcaId(marcaId)
                    .marcaNome(nomeMarca(marcaId, nomes))
                    .pedidos(pedidos)
                    .pares(grupo.stream().mapToLong(LinhaPedido::pares).sum())
                    .vendas(vendas)
                    .comissao(soma(grupo, LinhaPedido::comissao))
                    .ticketMedio(media(vendas, pedidos))
                    .participacaoVendas(participacao)
                    .build());
        });
        marcas.sort(Comparator.comparing(MarcaDesempenho::getVendas).reversed());
        return marcas;
    }

    static List<MarcaMensal> marcasPorMes(List<LinhaPedido> linhas, Map<String, String> nomes) {
        return linhas.stream()
                .sorted(Comparator.comparing(LinhaPedido::mes).thenComparing(LinhaPedido::marcaId))
                .map(l -> MarcaMensal.builder()
                        .mes(l.mes())
                        .marcaId(l.marcaId())
                        .marcaNome(nomeMarca(l.marcaId(), nomes))
                        .pedidos(l.pedidos())
                        .vendas(l.vendas())
                        .build())
                .collect(Collectors.toList());
    }

    static ResumoViagens resumoViagens(List<ViagemResponse> viagens) {
        BigDecimal vendas = somaViagens(viagens, ViagemResponse::getTotalVendas);
        BigDecimal despesas = somaViagens(viagens, ViagemResponse::getTotalDespesas);
        int finalizadas = (int) viagens.stream().filter(v -> v.getStatus() == StatusViagem.FINALIZADA).count();
        return ResumoViagens.builder()
                .quantidade(viagens.size())
                .finalizadas(finalizadas)
                .emAndamento(viagens.size() - finalizadas)
                .totalVendas(vendas)
                .totalDespesas(despesas)
                .resultado(vendas.subtract(despesas))
                .build();
    }

    static List<PontoViagemMensal> viagensPorMes(List<ViagemResponse> viagens) {
        Map<String, List<ViagemResponse>> porMes = viagens.stream()
                .collect(Collectors.groupingBy(
                        v -> v.getDataInicio() == null ? SEM_DATA : YearMonth.from(v.getDataInicio()).toString(),
                        TreeMap::new, Collectors.toList()));
        List<PontoViagemMensal> pontos = new ArrayList<>();
        porMes.forEach((mes, grupo) -> {
            BigDecimal vendas = somaViagens(grupo, ViagemResponse::getTotalVendas);
            BigDecimal despesas = somaViagens(grupo, ViagemResponse::getTotalDespesas);
            pontos.add(PontoViagemMensal.builder()
                    .mes(mes)
                    .viagens(grupo.size())
                    .vendas(vendas)
                    .despesas(despesas)
                    .resultado(vendas.subtract(despesas))
                    .build());
        });
        return pontos;
    }

    // Despesas das viagens do filtro, por categoria (nomes resolvidos como em DespesaService)
    private List<TotalCategoriaResponse> despesasPorCategoria(String usuarioId, List<ViagemResponse> viagens) {
        if (viagens.isEmpty()) {
            return List.of();
        }
        List<String> ids = viagens.stream().map(ViagemResponse::getId).collect(Collectors.toList());
        Map<String, Long> porCategoria = new HashMap<>();
        for (Despesa d : despesaRepository.findByUsuarioIdAndViagemIdIn(usuarioId, ids)) {
            porCategoria.merge(d.getCategoria(), d.getValorCentavos(), Long::sum);
        }
        Map<String, CategoriaResponse> categorias = categoriaService.mapa(usuarioId);
        return porCategoria.entrySet().stream()
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
    }

    // apoio

    private static String nomeMarca(String marcaId, Map<String, String> nomes) {
        if (SEM_MARCA.equals(marcaId)) {
            return "Sem marca";
        }
        return nomes.getOrDefault(marcaId, "Marca removida");
    }

    private static BigDecimal soma(List<LinhaPedido> linhas, Function<LinhaPedido, BigDecimal> campo) {
        return linhas.stream().map(campo).reduce(BigDecimal.ZERO.setScale(2), BigDecimal::add);
    }

    private static BigDecimal somaViagens(List<ViagemResponse> viagens, Function<ViagemResponse, BigDecimal> campo) {
        return viagens.stream()
                .map(v -> campo.apply(v) == null ? BigDecimal.ZERO : campo.apply(v))
                .reduce(BigDecimal.ZERO.setScale(2), BigDecimal::add);
    }

    private static BigDecimal media(BigDecimal total, int quantidade) {
        return quantidade > 0
                ? total.divide(BigDecimal.valueOf(quantidade), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO.setScale(2);
    }
}