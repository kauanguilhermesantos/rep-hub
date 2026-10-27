package com.rephub.controllers;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.rephub.dto.AssociarPedidosRequest;
import com.rephub.dto.PedidoViagemResponse;
import com.rephub.dto.PedidosViagemResponse;
import com.rephub.dto.ViagemRequest;
import com.rephub.dto.ViagemResponse;
import com.rephub.models.StatusViagem;
import com.rephub.models.Usuario;
import com.rephub.services.UsuarioService;
import com.rephub.services.ViagemService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/viagens")
public class ViagemController {

    private final ViagemService viagemService;
    private final UsuarioService usuarioService;

    // O dono vem SEMPRE do token (e-mail autenticado), nunca do corpo ou da URL
    private String usuarioId(Authentication authentication) {
        Usuario usuario = authentication == null ? null : usuarioService.findByEmail(authentication.getName());
        if (usuario == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }
        return usuario.getId();
    }

    @PostMapping
    public ResponseEntity<ViagemResponse> criar(Authentication authentication,
                                                @Valid @RequestBody ViagemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(viagemService.criar(usuarioId(authentication), request));
    }

    @GetMapping
    public ResponseEntity<List<ViagemResponse>> listar(
            Authentication authentication,
            @RequestParam(required = false) StatusViagem status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return ResponseEntity.ok(viagemService.listar(usuarioId(authentication), status, inicio, fim));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ViagemResponse> buscar(Authentication authentication, @PathVariable String id) {
        return ResponseEntity.ok(viagemService.buscar(usuarioId(authentication), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ViagemResponse> atualizar(Authentication authentication,
                                                    @PathVariable String id,
                                                    @Valid @RequestBody ViagemRequest request) {
        return ResponseEntity.ok(viagemService.atualizar(usuarioId(authentication), id, request));
    }

    // Finalização: idempotente; repetir a chamada devolve a viagem sem alterar a data original
    @PostMapping("/{id}/finalizar")
    public ResponseEntity<ViagemResponse> finalizar(Authentication authentication, @PathVariable String id) {
        return ResponseEntity.ok(viagemService.finalizar(usuarioId(authentication), id));
    }

    @GetMapping("/{id}/pedidos")
    public ResponseEntity<PedidosViagemResponse> pedidos(Authentication authentication, @PathVariable String id) {
        return ResponseEntity.ok(viagemService.pedidos(usuarioId(authentication), id));
    }

    @GetMapping("/{id}/pedidos-disponiveis")
    public ResponseEntity<List<PedidoViagemResponse>> pedidosDisponiveis(Authentication authentication,
                                                                         @PathVariable String id) {
        return ResponseEntity.ok(viagemService.pedidosDisponiveis(usuarioId(authentication), id));
    }

    @PostMapping("/{id}/pedidos")
    public ResponseEntity<PedidosViagemResponse> associarPedidos(Authentication authentication,
                                                                 @PathVariable String id,
                                                                 @Valid @RequestBody AssociarPedidosRequest request) {
        return ResponseEntity.ok(viagemService.associarPedidos(usuarioId(authentication), id, request.getPedidoIds()));
    }

    @DeleteMapping("/{id}/pedidos/{pedidoId}")
    public ResponseEntity<PedidosViagemResponse> removerPedido(Authentication authentication,
                                                               @PathVariable String id,
                                                               @PathVariable String pedidoId) {
        return ResponseEntity.ok(viagemService.removerPedido(usuarioId(authentication), id, pedidoId));
    }
}
