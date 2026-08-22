package com.rephub.controllers;

import com.rephub.dto.LoginRequest;
import com.rephub.dto.LoginResponse;
import com.rephub.models.Usuario;
import com.rephub.repositories.UsuarioRepository;
import com.rephub.security.CustomUserDetailsService;
import com.rephub.security.JwtService;
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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getSenha())
            );
        } catch (AuthenticationException e) {
            // Captura qualquer falha de autenticação (credenciais erradas,
            // usuário não encontrado, etc.) e responde 401 de forma consistente,
            // em vez de deixar a exceção "vazar" e o Spring Security devolver 403.
            return ResponseEntity.status(401).body("E-mail ou senha inválidos");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtService.generateToken(userDetails);

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail()).orElseThrow();

        LoginResponse response = new LoginResponse(
                token, usuario.getId(), usuario.getNomeCompleto(), usuario.getEmail()
        );
        return ResponseEntity.ok(response);
    }
}