package com.rephub.controllers;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

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

import com.rephub.models.Pedido;
import com.rephub.models.Usuario;
import com.rephub.services.PedidoService;
import com.rephub.services.UsuarioService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api/pedidos")
public class PedidoController {
    private final PedidoService pedidoService;
    private final UsuarioService usuarioService;

    // inicio/fim opcionais, no formato yyyy-MM-dd. Sem eles, retorna todos os pedidos.
    @GetMapping
    public ResponseEntity<List<Pedido>> getAllPedidos(
            Authentication authentication,
            @RequestParam(required = false) String inicio,
            @RequestParam(required = false) String fim
    ) {
        Usuario usuarioLogado = usuarioService.findByEmail(authentication.getName());

        LocalDateTime dataInicio = inicio != null ? LocalDate.parse(inicio).atStartOfDay() : null;
        LocalDateTime dataFim = fim != null ? LocalDate.parse(fim).atTime(LocalTime.MAX) : null;

        return ResponseEntity.ok(pedidoService.getPedidosDoUsuario(usuarioLogado.getId(), dataInicio, dataFim));
    }

    // Últimos pedidos do usuário logado, ordenados por data (mais recente primeiro).
    // Usado no dashboard. Ex: /api/pedidos/recentes?limit=5
    @GetMapping("/recentes")
    public ResponseEntity<List<Pedido>> getPedidosRecentes(
            Authentication authentication,
            @RequestParam(defaultValue = "5") int limit
    ) {
        Usuario usuarioLogado = usuarioService.findByEmail(authentication.getName());
        return ResponseEntity.ok(pedidoService.getPedidosRecentes(usuarioLogado.getId(), limit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> getPedidoById(Authentication authentication, @PathVariable String id) {
        Pedido pedido = pedidoService.findById(id);
        if (pedido == null || !pertenceAoUsuario(pedido, authentication)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(pedido);
    }

    @PostMapping
    public ResponseEntity<Pedido> createPedido(Authentication authentication, @RequestBody Pedido pedido) {
        Usuario usuarioLogado = usuarioService.findByEmail(authentication.getName());
        pedido.setUsuario(usuarioLogado);

        Pedido novoPedido = pedidoService.createPedido(pedido);
        return ResponseEntity.ok(novoPedido);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pedido> updatePedidoById(Authentication authentication, @PathVariable String id, @RequestBody Pedido pedido) {
        Pedido existente = pedidoService.findById(id);
        if (existente == null || !pertenceAoUsuario(existente, authentication)) {
            return ResponseEntity.notFound().build();
        }

        pedido.setId(id);
        Pedido pedidoAtualizado = pedidoService.updatePedido(pedido);
        return ResponseEntity.ok(pedidoAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePedidoById(Authentication authentication, @PathVariable String id) {
        Pedido pedido = pedidoService.findById(id);
        if (pedido == null || !pertenceAoUsuario(pedido, authentication)) {
            return ResponseEntity.notFound().build();
        }
        pedidoService.deletePedido(id);
        return ResponseEntity.noContent().build();
    }

    private boolean pertenceAoUsuario(Pedido pedido, Authentication authentication) {
        return pedido.getUsuario() != null
                && pedido.getUsuario().getEmail() != null
                && pedido.getUsuario().getEmail().equalsIgnoreCase(authentication.getName());
    }
}