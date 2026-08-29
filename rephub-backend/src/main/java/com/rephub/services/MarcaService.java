package com.rephub.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import com.rephub.models.Marca;
import com.rephub.models.Usuario;
import com.rephub.repositories.MarcaRepository;
import com.rephub.repositories.UsuarioRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class MarcaService {
    private MarcaRepository marcaRepository;
    private UsuarioRepository usuarioRepository;

    public List<Marca> getAllMarcas() {
        return marcaRepository.findAll();
    }

    public Marca findById(String id) {
        return marcaRepository.findById(id).orElse(null);
    }

    public Marca createMarca(Marca marca) {
        // Carrega o usuário associado à marca, se necessário
        if (marca.getUsuario() != null && marca.getUsuario().getId() != null) {
            Usuario usuario = usuarioRepository.findById(marca.getUsuario().getId()).orElse(null);
            marca.setUsuario(usuario);
        }

        if (marca.getDataCadastro() == null) {
            marca.setDataCadastro(LocalDateTime.now());
        }

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

        // Preserva campos que essa rota não deve alterar. Sem isso, o
        // BeanUtils.copyProperties abaixo sobrescreveria com "null" qualquer
        // campo que o cliente não tenha enviado no corpo da requisição
        // (ex: editar só o nome apagaria totalPedidos e o vínculo com o usuário).
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