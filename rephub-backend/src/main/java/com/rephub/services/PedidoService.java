package com.rephub.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.rephub.models.Marca;
import com.rephub.models.Pedido;
import com.rephub.models.Usuario;
import com.rephub.repositories.MarcaRepository;
import com.rephub.repositories.PedidoRepository;
import com.rephub.repositories.UsuarioRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class PedidoService {
    private PedidoRepository pedidoRepository;
    private MarcaRepository marcaRepository;
    private UsuarioRepository usuarioRepository;

    // Retorna apenas os pedidos do usuário informado, já com usuário e marca enriquecidos
    public List<Pedido> getPedidosDoUsuario(String usuarioId) {
        return pedidoRepository.findByUsuario_Id(usuarioId).stream()
                .map(this::enriquecer)
                .collect(Collectors.toList());
    }

    private Pedido enriquecer(Pedido pedido) {
        if (pedido.getUsuario() != null && pedido.getUsuario().getId() != null) {
            Usuario usuario = usuarioRepository.findById(pedido.getUsuario().getId()).orElse(null);
            pedido.setUsuario(usuario);
        }

        if (pedido.getMarca() != null && pedido.getMarca().getId() != null) {
            Marca marca = marcaRepository.findById(pedido.getMarca().getId()).orElse(null);
            if (marca != null) {
                Marca marcaResumida = new Marca();
                marcaResumida.setId(marca.getId());
                marcaResumida.setNome(marca.getNome());
                pedido.setMarca(marcaResumida);
            } else {
                pedido.setMarca(null);
            }
        }

        return pedido;
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
            Marca marca = marcaRepository.findById(pedido.getMarca().getId()).orElse(null);
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
            Marca marca = marcaRepository.findById(pedido.getMarca().getId())
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
        return pedido;
    }
}