package com.rephub.services;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.rephub.exceptions.RefreshTokenInvalidoException;
import com.rephub.models.RefreshToken;
import com.rephub.repositories.RefreshTokenRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-expiration-ms:2592000000}") // 30 dias por padrão
    private long refreshExpirationMs;

    public RefreshToken gerarToken(String usuarioId) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setUsuarioId(usuarioId);
        refreshToken.setCriadoEm(LocalDateTime.now());
        refreshToken.setExpiraEm(LocalDateTime.now().plusSeconds(refreshExpirationMs / 1000));
        refreshToken.setRevogado(false);
        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken validarEBuscar(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new RefreshTokenInvalidoException("Sessão inválida, faça login novamente"));

        if (refreshToken.isRevogado()) {
            throw new RefreshTokenInvalidoException("Sessão encerrada, faça login novamente");
        }

        if (refreshToken.getExpiraEm().isBefore(LocalDateTime.now())) {
            throw new RefreshTokenInvalidoException("Sessão expirada, faça login novamente");
        }

        return refreshToken;
    }

    // Revoga um token específico (usado no logout e na rotação a cada refresh)
    public void revogar(String token) {
        refreshTokenRepository.findByToken(token).ifPresent(rt -> {
            rt.setRevogado(true);
            refreshTokenRepository.save(rt);
        });
    }

    // Revoga todas as sessões de um usuário (útil para "sair de todos os dispositivos")
    public void revogarTodosDoUsuario(String usuarioId) {
        refreshTokenRepository.deleteByUsuarioId(usuarioId);
    }
}