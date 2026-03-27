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

        // Adiciona a data de cadastro
        if (marca.getDataCadastro() == null) {
            marca.setDataCadastro(LocalDateTime.now());
        }

        // Define o total de pedidos como 0 ao criar uma nova marca
        if (marca.getTotalPedidos() == null) {
            marca.setTotalPedidos(0);
        }

        // Salva a marca no banco de dados
        return marcaRepository.save(marca);
    }

    public Marca updateMarca(Marca marca) {
        // Verifica se a marca e o ID são válidos
        if (marca == null || marca.getId() == null) {
            return null;
        }

        // Verifica se a marca existe no banco de dados
        Marca existingMarca = findById(marca.getId());
        if (existingMarca == null) {
            return null;
        }

        // Se veio um usuário associado, carrega o usuário do banco de dados
        if (marca.getUsuario() != null && marca.getUsuario().getId() != null) {
            Usuario usuario = usuarioRepository.findById(marca.getUsuario().getId()).orElse(null);
            marca.setUsuario(usuario);
        }

        // Mantém a data de cadastro original
        marca.setDataCadastro(existingMarca.getDataCadastro());

        // Atualiza os campos da marca existente com os valores da marca recebida
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
