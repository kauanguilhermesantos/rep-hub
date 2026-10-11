package com.rephub.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.rephub.models.Marca;

@Repository
public interface MarcaRepository extends MongoRepository<Marca, String> {
    List<Marca> findByUsuario_Id(String usuarioId);

    Optional<Marca> findByIdAndUsuario_Id(String id, String usuarioId);
}