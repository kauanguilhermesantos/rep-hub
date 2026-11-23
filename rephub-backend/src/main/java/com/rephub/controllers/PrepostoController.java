package com.rephub.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.rephub.dto.PaginaPrepostosResponse;
import com.rephub.dto.PrepostoRequest;
import com.rephub.dto.PrepostoResponse;
import com.rephub.models.Usuario;
import com.rephub.services.PrepostoService;
import com.rephub.services.UsuarioService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/prepostos")
public class PrepostoController {

    private final PrepostoService prepostoService;
    private final UsuarioService usuarioService;

    // O dono vem SEMPRE do token, nunca do corpo ou da URL
    private String usuarioId(Authentication authentication) {
        Usuario usuario = authentication == null ? null : usuarioService.findByEmail(authentication.getName());
        if (usuario == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }
        return usuario.getId();
    }

    // GET /api/prepostos?page=0&size=20&situacao=ativos&busca=jo&ordenarPor=nome&direcao=asc
    @GetMapping
    public ResponseEntity<PaginaPrepostosResponse> listar(
            Authentication authentication,
            @RequestParam(defaultValue = "ativos") String situacao,
            @RequestParam(required = false) String busca,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "nome") String ordenarPor,
            @RequestParam(defaultValue = "asc") String direcao
    ) {
        return ResponseEntity.ok(prepostoService.listar(
                usuarioId(authentication), situacao, busca, page, size, ordenarPor, direcao));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrepostoResponse> buscar(Authentication authentication, @PathVariable String id) {
        return ResponseEntity.ok(prepostoService.buscar(usuarioId(authentication), id));
    }

    @PostMapping
    public ResponseEntity<PrepostoResponse> criar(Authentication authentication,
                                                  @Valid @RequestBody PrepostoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(prepostoService.criar(usuarioId(authentication), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PrepostoResponse> editar(Authentication authentication,
                                                   @PathVariable String id,
                                                   @Valid @RequestBody PrepostoRequest request) {
        return ResponseEntity.ok(prepostoService.editar(usuarioId(authentication), id, request));
    }
}
