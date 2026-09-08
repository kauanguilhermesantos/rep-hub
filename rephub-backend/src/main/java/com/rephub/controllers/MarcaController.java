package com.rephub.controllers;

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
import org.springframework.web.bind.annotation.RestController;

import com.rephub.dto.MarcaRequest;
import com.rephub.models.Marca;
import com.rephub.models.Usuario;
import com.rephub.services.MarcaService;
import com.rephub.services.UsuarioService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api/marcas")
public class MarcaController {
    private final MarcaService marcaService;
    private final UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<List<Marca>> getAllMarcas(Authentication authentication) {
        Usuario usuarioLogado = usuarioService.findByEmail(authentication.getName());
        return ResponseEntity.ok(marcaService.getAllMarcas(usuarioLogado.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Marca> getMarcaById(@PathVariable String id) {
        Marca marca = marcaService.findById(id);
        if (marca == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(marca);
    }

    @PostMapping
    public ResponseEntity<Marca> createMarca(Authentication authentication, @Valid @RequestBody MarcaRequest request) {
        Usuario usuarioLogado = usuarioService.findByEmail(authentication.getName());

        Marca marca = new Marca();
        marca.setNome(request.getNome());
        marca.setUsuario(usuarioLogado);

        return ResponseEntity.ok(marcaService.createMarca(marca));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Marca> updateMarcaById(@PathVariable String id, @Valid @RequestBody MarcaRequest request) {
        Marca marca = new Marca();
        marca.setId(id);
        marca.setNome(request.getNome());

        Marca marcaAtualizada = marcaService.updateMarca(marca);

        if (marcaAtualizada == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(marcaAtualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Marca> deleteMarcaById(@PathVariable String id) {
        Marca marca = marcaService.deleteMarca(id);
        if (marca == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}