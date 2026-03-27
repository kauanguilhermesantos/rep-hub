package com.rephub.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rephub.models.Marca;
import com.rephub.services.MarcaService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api/marcas")
public class MarcaController {
    private final MarcaService marcaService; // Injeção de dependência do serviço de marca

    @GetMapping
    public ResponseEntity<List<Marca>> getAllMarcas() {
        return ResponseEntity.ok(marcaService.getAllMarcas());
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
    public ResponseEntity<Marca> createMarca(@RequestBody Marca marca) {
        return ResponseEntity.ok(marcaService.createMarca(marca));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Marca> updateMarcaById(@PathVariable String id, @RequestBody Marca marca) {
        marca.setId(id);

        Marca marcaAtualizada = marcaService.updateMarca(marca);

        if(marcaAtualizada == null) {
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
