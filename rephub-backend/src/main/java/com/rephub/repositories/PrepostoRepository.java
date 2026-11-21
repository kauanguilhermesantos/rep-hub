package com.rephub.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.rephub.models.Preposto;

@Repository
public interface PrepostoRepository extends MongoRepository<Preposto, String> {

    List<Preposto> findByUsuarioId(String usuarioId);

    // Sempre filtrada pelo dono: preposto de outro usuário responde como "não encontrado"
    Optional<Preposto> findByIdAndUsuarioId(String id, String usuarioId);
}
