package com.rephub.controllers;

import java.util.List;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rephub.dto.AlterarSenhaRequest;
import com.rephub.dto.AtualizarPerfilRequest;
import com.rephub.dto.AtualizarPerfilResponse;
import com.rephub.dto.ExcluirContaRequest;
import com.rephub.exceptions.SenhaInvalidaException;
import com.rephub.models.Usuario;
import com.rephub.security.CustomUserDetailsService;
import com.rephub.security.JwtService;
import com.rephub.services.UsuarioService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private final UsuarioService usuarioService;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @GetMapping
    public ResponseEntity<List<Usuario>> getAllUsuarios() {
        return ResponseEntity.ok(usuarioService.getAllUsuarios());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable String id) {
        return ResponseEntity.ok(usuarioService.findById(id));
    }

    @GetMapping("/me")
    public ResponseEntity<Usuario> getMe(Authentication authentication) {
        Usuario usuario = usuarioService.findByEmail(authentication.getName());
        if (usuario == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(usuario);
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(Authentication authentication, @RequestBody AtualizarPerfilRequest request) {
        String emailAtual = authentication.getName();
        boolean emailAlterado = request.getEmail() != null
                && !request.getEmail().equalsIgnoreCase(emailAtual);

        Usuario usuarioAtualizado;
        try {
            usuarioAtualizado = usuarioService.atualizarPerfil(emailAtual, request);
        } catch (DuplicateKeyException e) {
            return ResponseEntity.status(409).body("Já existe uma conta com esse e-mail");
        }

        if (usuarioAtualizado == null) {
            return ResponseEntity.notFound().build();
        }

        String novoToken = null;
        if (emailAlterado) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(usuarioAtualizado.getEmail());
            novoToken = jwtService.generateToken(userDetails);
        }

        return ResponseEntity.ok(new AtualizarPerfilResponse(usuarioAtualizado, novoToken));
    }

    // Troca a senha do usuário logado, exigindo a senha atual como confirmação
    @PutMapping("/me/senha")
    public ResponseEntity<?> alterarSenha(Authentication authentication, @RequestBody AlterarSenhaRequest request) {
        try {
            usuarioService.alterarSenha(authentication.getName(), request.getSenhaAtual(), request.getNovaSenha());
        } catch (SenhaInvalidaException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
        return ResponseEntity.noContent().build();
    }

    // Exclui a conta do usuário logado, exigindo a senha como confirmação
    @DeleteMapping("/me")
    public ResponseEntity<?> excluirMinhaConta(Authentication authentication, @RequestBody ExcluirContaRequest request) {
        try {
            usuarioService.excluirConta(authentication.getName(), request.getSenha());
        } catch (SenhaInvalidaException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<Usuario> createUsuario(@RequestBody Usuario usuario) {
        return ResponseEntity.ok(usuarioService.createUsuario(usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> updateUsuarioById(@PathVariable String id, @RequestBody Usuario usuario) {
        usuario.setId(id);

        Usuario usuarioAtualizado = usuarioService.updateUsuario(usuario);

        if(usuarioAtualizado == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(usuarioAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Usuario> deleteUsuarioById(@PathVariable String id) {
        usuarioService.deleteUsuario(id);
        return ResponseEntity.noContent().build();
    }
}