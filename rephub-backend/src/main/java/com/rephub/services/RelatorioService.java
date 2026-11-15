package com.rephub.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import com.rephub.dto.MarcaRelatorioResponse;
import com.rephub.dto.CategoriaResponse;
import com.rephub.dto.RelatorioDespesasResponse;
import com.rephub.dto.RelatorioDespesasResponse.Agrupamento;
import com.rephub.dto.RelatorioGeralResponse;
import com.rephub.models.Despesa;
import com.rephub.models.Pedido;
import com.rephub.repositories.PedidoRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class RelatorioService {
    private final PedidoRepository pedidoRepository;
    private final ViagemService viagemService;
    private final CategoriaDespesaService categoriaService;
    private final MongoTemplate mongoTemplate;

    // Agrega os pedidos do usuário por marca, e calcula os totais gerais.
    // Se inicio/fim forem nulos, considera todos os pedidos (sem filtro de data).
    public RelatorioGeralResponse gerarRelatorio(String usuarioId, LocalDateTime inicio, LocalDateTime fim) {
        List<Pedido> pedidos = (inicio != null && fim != null)
                ? pedidoRepository.findByUsuario_IdAndDataCadastroBetween(usuarioId, inicio, fim)
                : pedidoRepository.findByUsuario_Id(usuarioId);

        Map<String, MarcaRelatorioResponse> agregadoPorMarca = new LinkedHashMap<>();

        int totalPedidos = 0;
        int totalPares = 0;
        double valorTotalVendas = 0;
        double valorTotalComissao = 0;

        for (Pedido pedido : pedidos) {
            int pares = pedido.getQuantPares() != null ? pedido.getQuantPares() : 0;
            double valor = pedido.getValorTotal() != null ? pedido.getValorTotal() : 0;
            double comissao = pedido.getValorComissao() != null ? pedido.getValorComissao() : 0;

            totalPedidos++;
            totalPares += pares;
            valorTotalVendas += valor;
            valorTotalComissao += comissao;

            String marcaId = pedido.getMarca() != null ? pedido.getMarca().getId() : "sem-marca";
            String marcaNome = pedido.getMarca() != null ? pedido.getMarca().getNome() : "Sem marca";

            MarcaRelatorioResponse item = agregadoPorMarca.computeIfAbsent(marcaId,
                    id -> new MarcaRelatorioResponse(marcaId, marcaNome, 0, 0, 0, 0));

            item.setTotalPedidos(item.getTotalPedidos() + 1);
            item.setTotalPares(item.getTotalPares() + pares);
            item.setValorTotalVendas(item.getValorTotalVendas() + valor);
            item.setValorTotalComissao(item.getValorTotalComissao() + comissao);
        }

        List<MarcaRelatorioResponse> vendasPorMarca = new ArrayList<>(agregadoPorMarca.values());

        return new RelatorioGeralResponse(totalPedidos, totalPares, valorTotalVendas, valorTotalComissao, vendasPorMarca);
    }

    /**
     * Todas as despesas da viagem (sem paginação) agrupadas por forma de pagamento ou categoria,
     * num único $match + $group no Mongo. Viagem de outro usuário responde 404.
     */
    public RelatorioDespesasResponse despesasAgrupadas(String usuarioId, String viagemId, Agrupamento agruparPor) {
        viagemService.obter(usuarioId, viagemId);
        String campo = agruparPor == Agrupamento.CATEGORIA ? "categoria" : "formaPagamento";

        Aggregation agregacao = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("usuarioId").is(usuarioId).and("viagemId").is(viagemId)),
                Aggregation.group(campo).sum("valorCentavos").as("totalCentavos").count().as("quantidade"));
        List<RelatorioDespesasResponse.Grupo> grupos = mongoTemplate
                .aggregate(agregacao, Despesa.class, RelatorioDespesasResponse.Grupo.class)
                .getMappedResults();

        if (agruparPor != Agrupamento.CATEGORIA) {
            return RelatorioDespesasResponse.of(grupos, chave -> null); // rótulos das formas ficam no frontend
        }
        // Nome resolvido na leitura (reflete renomeações), como na listagem de despesas
        Map<String, CategoriaResponse> categorias = categoriaService.mapa(usuarioId);
        return RelatorioDespesasResponse.of(grupos, chave -> {
            CategoriaResponse c = categorias.get(chave);
            return c != null ? c.getNome() : "Categoria removida";
        });
    }
}
