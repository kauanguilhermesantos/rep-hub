package com.rephub.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.rephub.dto.AtualizarPerfilRequest;
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

    public Usuario findByEmail(String email) {
        return usuarioRepository.findByEmail(email).orElse(null);
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

    /**
     * Atualização de perfil feita pelo próprio usuário logado.
     * Só altera nome, e-mail e telefone — NUNCA senha ou cargo por essa via.
     */
    public Usuario atualizarPerfil(String emailAtual, AtualizarPerfilRequest request) {
        Usuario usuario = findByEmail(emailAtual);
        if (usuario == null) {
            return null;
        }

        if (request.getNomeCompleto() != null && !request.getNomeCompleto().isBlank()) {
            usuario.setNomeCompleto(request.getNomeCompleto());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            usuario.setEmail(request.getEmail().trim().toLowerCase());
        }

        if (request.getTelefone() != null && !request.getTelefone().isBlank()) {
            usuario.setTelefone(request.getTelefone());
        }

        return usuarioRepository.save(usuario);
    }

    public void atualizarUltimoAcesso(String email) {
        Usuario usuario = findByEmail(email);
        if (usuario != null) {
            usuario.setUltimoAcesso(LocalDateTime.now());
            usuarioRepository.save(usuario);
        }
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