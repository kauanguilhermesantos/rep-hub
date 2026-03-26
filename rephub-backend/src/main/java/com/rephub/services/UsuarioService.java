package com.rephub.services;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import com.rephub.models.Usuario;
import com.rephub.repositories.UsuarioRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class UsuarioService {
    private UsuarioRepository usuarioRepository;

    public List<Usuario> getAllUsuarios() {
        return usuarioRepository.findAll();
    }

    public Usuario findById(String id) {
        return usuarioRepository.findById(id).orElse(null);
    }

    public Usuario createUsuario(Usuario usuario) {
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
