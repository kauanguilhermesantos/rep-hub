package com.rephub.controllers;

import com.rephub.dto.LoginRequest;
import com.rephub.dto.LoginResponse;
import com.rephub.dto.RefreshTokenRequest;
import com.rephub.dto.RefreshTokenResponse;
import com.rephub.exceptions.RefreshTokenInvalidoException;
import com.rephub.models.RefreshToken;
import com.rephub.models.Usuario;
import com.rephub.repositories.UsuarioRepository;
import com.rephub.security.CustomUserDetailsService;
import com.rephub.security.JwtService;
import com.rephub.services.RefreshTokenService;
import com.rephub.services.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getSenha())
            );
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body("E-mail ou senha inválidos");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtService.generateToken(userDetails);

        usuarioService.atualizarUltimoAcesso(request.getEmail());

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail()).orElseThrow();

        RefreshToken refreshToken = refreshTokenService.gerarToken(usuario.getId());

        LoginResponse response = new LoginResponse(
                token, refreshToken.getToken(), usuario.getId(), usuario.getNomeCompleto(), usuario.getEmail()
        );
        return ResponseEntity.ok(response);
    }

    // Troca um refresh token válido por um access token novo. O refresh token
    // também é rotacionado (o antigo é revogado e um novo é emitido) — assim,
    // se um refresh token vazado for usado por alguém mal-intencionado, o uso
    // legítimo seguinte vai falhar e pode servir de sinal de comprometimento.
    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        RefreshToken tokenAtual = refreshTokenService.validarEBuscar(request.getRefreshToken());

        Usuario usuario = usuarioRepository.findById(tokenAtual.getUsuarioId())
                .orElseThrow(() -> new RefreshTokenInvalidoException("Sessão inválida, faça login novamente"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(usuario.getEmail());
        String novoAccessToken = jwtService.generateToken(userDetails);

        refreshTokenService.revogar(tokenAtual.getToken());
        RefreshToken novoRefreshToken = refreshTokenService.gerarToken(usuario.getId());

        return ResponseEntity.ok(new RefreshTokenResponse(novoAccessToken, novoRefreshToken.getToken()));
    }

    // Revoga o refresh token no servidor (logout de verdade, não só client-side).
    // Se o token já não existir/for inválido, não há problema — o objetivo é
    // apenas garantir que ele não funcione mais.
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody RefreshTokenRequest request) {
        if (request.getRefreshToken() != null && !request.getRefreshToken().isBlank()) {
            refreshTokenService.revogar(request.getRefreshToken());
        }
        return ResponseEntity.noContent().build();
    }
}