package com.rephub.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.BeanUtils;
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
public class MarcaService {
    private MarcaRepository marcaRepository;
    private UsuarioRepository usuarioRepository;
    private PedidoRepository pedidoRepository;

    /**
     * Retorna todas as marcas com o totalPedidos calculado na hora, contando
     * apenas os pedidos do usuário informado (nunca confiamos em um contador
     * salvo, que ficaria desatualizado a cada pedido criado/editado/excluído).
     */
    public List<Marca> getAllMarcas(String usuarioId) {
        List<Marca> marcas = marcaRepository.findAll();
        List<Pedido> pedidosDoUsuario = pedidoRepository.findByUsuario_Id(usuarioId);

        Map<String, Long> contagemPorMarca = pedidosDoUsuario.stream()
                .filter(p -> p.getMarca() != null && p.getMarca().getId() != null)
                .collect(Collectors.groupingBy(p -> p.getMarca().getId(), Collectors.counting()));

        marcas.forEach(marca -> {
            long total = contagemPorMarca.getOrDefault(marca.getId(), 0L);
            marca.setTotalPedidos((int) total);
        });

        return marcas;
    }

    public Marca findById(String id) {
        return marcaRepository.findById(id).orElse(null);
    }

    public Marca createMarca(Marca marca) {
        if (marca.getUsuario() != null && marca.getUsuario().getId() != null) {
            Usuario usuario = usuarioRepository.findById(marca.getUsuario().getId()).orElse(null);
            marca.setUsuario(usuario);
        }

        if (marca.getDataCadastro() == null) {
            marca.setDataCadastro(LocalDateTime.now());
        }

        // Esse valor é só o inicial no banco — na leitura (getAllMarcas),
        // o total real é sempre recalculado a partir dos pedidos.
        if (marca.getTotalPedidos() == null) {
            marca.setTotalPedidos(0);
        }

        return marcaRepository.save(marca);
    }

    public Marca updateMarca(Marca marca) {
        if (marca == null || marca.getId() == null) {
            return null;
        }

        Marca existingMarca = findById(marca.getId());
        if (existingMarca == null) {
            return null;
        }

        marca.setDataCadastro(existingMarca.getDataCadastro());
        marca.setUsuario(existingMarca.getUsuario());
        if (marca.getTotalPedidos() == null) {
            marca.setTotalPedidos(existingMarca.getTotalPedidos());
        }

        BeanUtils.copyProperties(marca, existingMarca);
        return marcaRepository.save(existingMarca);
    }

    public Marca deleteMarca(String id) {
        Marca marca = findById(id);
        if (marca == null) {
            return null;
        }
        marcaRepository.deleteById(id);
        return marca;
    }
}