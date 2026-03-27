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
    
    public List<Pedido> getAllPedidos() {
        List<Pedido> pedidos = pedidoRepository.findAll();
        
        // Carrega os dados completos de usuário e marca para cada pedido
        return pedidos.stream().map(pedido -> {
            // Carrega o usuário completo
            if (pedido.getUsuario() != null && pedido.getUsuario().getId() != null) {
                Usuario usuario = usuarioRepository.findById(pedido.getUsuario().getId()).orElse(null);
                pedido.setUsuario(usuario);
            }
            
            // Carrega apenas o nome da marca
            if (pedido.getMarca() != null && pedido.getMarca().getId() != null) {
                Marca marca = marcaRepository.findById(pedido.getMarca().getId()).orElse(null);
                if (marca != null) {
                    // Opção 1: Carregar marca completa
                    // pedido.setMarca(marca);
                    
                    // Opção 2: Carregar apenas nome (se preferir)
                    Marca marcaResumida = new Marca();
                    marcaResumida.setId(marca.getId());
                    marcaResumida.setNome(marca.getNome());
                    pedido.setMarca(marcaResumida);
                } else {
                    pedido.setMarca(null);
                }
            }
            
            return pedido;
        }).collect(Collectors.toList());
    }


    public Pedido findById(String id) {
        return pedidoRepository.findById(id).orElse(null);
    }

    public Pedido createPedido(Pedido pedido) {
        // Carrega o usuário associado ao pedido, se necessário
        if (pedido.getUsuario() != null && pedido.getUsuario().getId() != null) {
            Usuario usuario = usuarioRepository.findById(pedido.getUsuario().getId()).orElse(null);
            pedido.setUsuario(usuario);
        }

        // Carrega a marca associada ao pedido, se necessário
        if (pedido.getMarca() != null && pedido.getMarca().getId() != null) {
            Marca marca = marcaRepository.findById(pedido.getMarca().getId()).orElse(null);
            pedido.setMarca(marca);
        }

        // Define a data de cadastro do pedido
        if (pedido.getDataCadastro() == null) {
            pedido.setDataCadastro(LocalDateTime.now());
        }

        // Salva o pedido no banco de dados
        return pedidoRepository.save(pedido);
    }

    public Pedido updatePedido(Pedido pedido) {
        // Verifica se o pedido e o ID são válidos
        if (pedido == null || pedido.getId() == null) {
            return null;
        }

        // Verifica se o pedido existe no banco de dados
        Pedido existingPedido = findById(pedido.getId());
        if (existingPedido == null) {
            return null;
        }

        // Atualiza apenas os campos que foram modificados
        if (pedido.getUsuario() != null) {
            if (pedido.getUsuario().getId() != null) {
                // Se veio um ID, carrega o usuário completo
                Usuario usuario = usuarioRepository.findById(pedido.getUsuario().getId())
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado!"));
                existingPedido.setUsuario(usuario);
            } else {
                // Se veio um objeto usuário mas sem ID, mantém o existente
                existingPedido.setUsuario(existingPedido.getUsuario());
            }
        }
        // Se veio uma marca associada, carrega a marca do banco de dados
        if (pedido.getMarca() != null) {
            if (pedido.getMarca().getId() != null) {
                Marca marca = marcaRepository.findById(pedido.getMarca().getId())
                    .orElseThrow(() -> new RuntimeException("Marca não encontrada!"));
                existingPedido.setMarca(marca);
            }
        }

        // Nome do cliente
        if (pedido.getCliente() != null) {
            existingPedido.setCliente(pedido.getCliente());
        }

        // Quantidade de pares
        if (pedido.getQuantPares() != null) {
            existingPedido.setQuantPares(pedido.getQuantPares());
        }

        // Valor total
        if (pedido.getValorTotal() != null) {
            existingPedido.setValorTotal(pedido.getValorTotal());
        }

        // Valor da comissão
        if (pedido.getValorComissao() != null) {
            existingPedido.setValorComissao(pedido.getValorComissao());
        }

        // Condição de pagamento
        if (pedido.getCondicaoPagamento() != null) {
            existingPedido.setCondicaoPagamento(pedido.getCondicaoPagamento());
        }

        // Anexo URL
        if (pedido.getAnexoUrl() != null) {
            existingPedido.setAnexoUrl(pedido.getAnexoUrl());
        }

        // Salva o pedido atualizado no banco de dados
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
