package com.rephub.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.rephub.dto.CategoriaRequest;
import com.rephub.dto.CategoriaResponse;
import com.rephub.models.Usuario;
import com.rephub.services.CategoriaDespesaService;
import com.rephub.services.UsuarioService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/categorias-despesa")
public class CategoriaDespesaController {

    private final CategoriaDespesaService categoriaService;
    private final UsuarioService usuarioService;

    // O dono vem SEMPRE do token, nunca do corpo ou da URL
    private String usuarioId(Authentication authentication) {
        Usuario usuario = authentication == null ? null : usuarioService.findByEmail(authentication.getName());
        if (usuario == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }
        return usuario.getId();
    }

    @GetMapping
    public ResponseEntity<List<CategoriaResponse>> listar(Authentication authentication) {
        return ResponseEntity.ok(categoriaService.listar(usuarioId(authentication)));
    }

    @PostMapping
    public ResponseEntity<CategoriaResponse> criar(Authentication authentication,
                                                   @Valid @RequestBody CategoriaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoriaService.criar(usuarioId(authentication), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaResponse> atualizar(Authentication authentication,
                                                       @PathVariable String id,
                                                       @Valid @RequestBody CategoriaRequest request) {
        return ResponseEntity.ok(categoriaService.atualizar(usuarioId(authentication), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(Authentication authentication, @PathVariable String id) {
        categoriaService.excluir(usuarioId(authentication), id);
        return ResponseEntity.noContent().build();
    }
}
