package com.rephub.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rephub.dto.RelatorioGeralResponse;
import com.rephub.models.Usuario;
import com.rephub.services.RelatorioService;
import com.rephub.services.UsuarioService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api/relatorios")
public class RelatorioController {
    private final RelatorioService relatorioService;
    private final UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<RelatorioGeralResponse> getRelatorio(Authentication authentication) {
        Usuario usuarioLogado = usuarioService.findByEmail(authentication.getName());
        return ResponseEntity.ok(relatorioService.gerarRelatorio(usuarioLogado.getId()));
    }
}