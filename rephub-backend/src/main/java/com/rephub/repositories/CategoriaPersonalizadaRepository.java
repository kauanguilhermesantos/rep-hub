package com.rephub.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.rephub.models.CategoriaPersonalizada;

@Repository
public interface CategoriaPersonalizadaRepository extends MongoRepository<CategoriaPersonalizada, String> {

    List<CategoriaPersonalizada> findByUsuarioId(String usuarioId);

    // Sempre filtrada pelo dono: categoria de outro usuário responde como "não encontrada"
    Optional<CategoriaPersonalizada> findByIdAndUsuarioId(String id, String usuarioId);

    Optional<CategoriaPersonalizada> findByUsuarioIdAndNomeNormalizado(String usuarioId, String nomeNormalizado);
}
