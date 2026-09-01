package com.rephub.services;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.rephub.dto.MarcaRelatorioResponse;
import com.rephub.dto.RelatorioGeralResponse;
import com.rephub.models.Pedido;
import com.rephub.repositories.PedidoRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class RelatorioService {
    private final PedidoRepository pedidoRepository;

    // Agrega os pedidos do usuário por marca, e calcula os totais gerais
    public RelatorioGeralResponse gerarRelatorio(String usuarioId) {
        List<Pedido> pedidos = pedidoRepository.findByUsuario_Id(usuarioId);

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
}