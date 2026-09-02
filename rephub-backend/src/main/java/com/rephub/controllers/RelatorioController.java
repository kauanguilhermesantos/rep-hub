package com.rephub.controllers;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    // inicio/fim no formato yyyy-MM-dd (ex: 2026-01-31). Se omitidos, retorna tudo.
    @GetMapping
    public ResponseEntity<RelatorioGeralResponse> getRelatorio(
            Authentication authentication,
            @RequestParam(required = false) String inicio,
            @RequestParam(required = false) String fim
    ) {
        Usuario usuarioLogado = usuarioService.findByEmail(authentication.getName());

        LocalDateTime dataInicio = inicio != null ? LocalDate.parse(inicio).atStartOfDay() : null;
        LocalDateTime dataFim = fim != null ? LocalDate.parse(fim).atTime(LocalTime.MAX) : null;

        return ResponseEntity.ok(relatorioService.gerarRelatorio(usuarioLogado.getId(), dataInicio, dataFim));
    }
}