package com.rephub.controllers;

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

import com.rephub.dto.DespesaRequest;
import com.rephub.dto.DespesaResponse;
import com.rephub.dto.DespesasViagemResponse;
import com.rephub.models.Usuario;
import com.rephub.services.DespesaService;
import com.rephub.services.UsuarioService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/viagens/{viagemId}/despesas")
public class DespesaController {

    private final DespesaService despesaService;
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
    public ResponseEntity<DespesasViagemResponse> listar(Authentication authentication,
                                                         @PathVariable String viagemId) {
        return ResponseEntity.ok(despesaService.listar(usuarioId(authentication), viagemId));
    }

    @GetMapping("/{despesaId}")
    public ResponseEntity<DespesaResponse> buscar(Authentication authentication,
                                                  @PathVariable String viagemId,
                                                  @PathVariable String despesaId) {
        return ResponseEntity.ok(despesaService.buscar(usuarioId(authentication), viagemId, despesaId));
    }

    @PostMapping
    public ResponseEntity<DespesaResponse> criar(Authentication authentication,
                                                 @PathVariable String viagemId,
                                                 @Valid @RequestBody DespesaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(despesaService.criar(usuarioId(authentication), viagemId, request));
    }

    @PutMapping("/{despesaId}")
    public ResponseEntity<DespesaResponse> atualizar(Authentication authentication,
                                                     @PathVariable String viagemId,
                                                     @PathVariable String despesaId,
                                                     @Valid @RequestBody DespesaRequest request) {
        return ResponseEntity.ok(despesaService.atualizar(usuarioId(authentication), viagemId, despesaId, request));
    }

    @DeleteMapping("/{despesaId}")
    public ResponseEntity<Void> excluir(Authentication authentication,
                                        @PathVariable String viagemId,
                                        @PathVariable String despesaId) {
        despesaService.excluir(usuarioId(authentication), viagemId, despesaId);
        return ResponseEntity.noContent().build();
    }
}
