package com.rephub.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.rephub.models.Usuario;
import com.rephub.repositories.UsuarioRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class UsuarioService {
    private UsuarioRepository usuarioRepository;
    private PasswordEncoder passwordEncoder;

    public List<Usuario> getAllUsuarios() {
        return usuarioRepository.findAll();
    }

    public Usuario findById(String id) {
        return usuarioRepository.findById(id).orElse(null);
    }

    public Usuario createUsuario(Usuario usuario) {
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        usuario.setDataCadastro(LocalDateTime.now());
        return usuarioRepository.save(usuario);
    }

    public Usuario updateUsuario(Usuario usuario) {
        if (usuario == null || usuario.getId() == null) {
            return null;
        }
        Usuario existingUsuario = findById(usuario.getId());
        if (existingUsuario == null) {
            return null;
        }

        usuario.setDataCadastro(existingUsuario.getDataCadastro());

        // Só re-hasheia a senha se uma nova senha foi enviada no update;
        // caso contrário, mantém o hash já existente
        if (usuario.getSenha() == null || usuario.getSenha().isBlank()) {
            usuario.setSenha(existingUsuario.getSenha());
        } else {
            usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        }

        BeanUtils.copyProperties(usuario, existingUsuario);
        return usuarioRepository.save(existingUsuario);
    }

    public Usuario deleteUsuario(String id) {
        Usuario usuario = findById(id);
        if (usuario == null) {
            return null;
        }
        usuarioRepository.deleteById(id);
        return usuario;
    }
}