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
     * Retorna as marcas do usuário informado com o totalPedidos calculado na hora, contando
     * apenas os pedidos do usuário informado (nunca confiamos em um contador
     * salvo, que ficaria desatualizado a cada pedido criado/editado/excluído).
     */
    public List<Marca> getAllMarcas(String usuarioId) {
        List<Marca> marcas = marcaRepository.findAll().stream()
                .filter(m -> pertenceAoUsuario(m, usuarioId))
                .collect(Collectors.toList());
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

    /** Busca sem checar dono — uso interno. Para requisições, use findByIdDoUsuario. */
    public Marca findById(String id) {
        return marcaRepository.findById(id).orElse(null);
    }

    /** Retorna a marca só se pertencer ao usuário; caso contrário, null (vira 404). */
    public Marca findByIdDoUsuario(String id, String usuarioId) {
        Marca marca = marcaRepository.findById(id).orElse(null);
        return pertenceAoUsuario(marca, usuarioId) ? marca : null;
    }

    /** Checagem explícita do dono, independente do mapeamento das consultas derivadas. */
    public boolean pertenceAoUsuario(Marca marca, String usuarioId) {
        return marca != null
                && usuarioId != null
                && marca.getUsuario() != null
                && usuarioId.equals(marca.getUsuario().getId());
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

    public Marca updateMarca(Marca marca, String usuarioId) {
        if (marca == null || marca.getId() == null) {
            return null;
        }

        Marca existingMarca = findByIdDoUsuario(marca.getId(), usuarioId);
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

    public Marca deleteMarca(String id, String usuarioId) {
        Marca marca = findByIdDoUsuario(id, usuarioId);
        if (marca == null) {
            return null;
        }
        marcaRepository.deleteById(id);
        return marca;
    }
}