package com.rephub.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.rephub.models.Viagem;

@Repository
public interface ViagemRepository extends MongoRepository<Viagem, String> {

    // Busca sempre filtrada pelo dono: quem não é dono recebe "não encontrada"
    Optional<Viagem> findByIdAndUsuarioId(String id, String usuarioId);

    List<Viagem> findByUsuarioId(String usuarioId);
}
