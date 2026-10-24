package com.rephub.repositories;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.rephub.models.Despesa;

@Repository
public interface DespesaRepository extends MongoRepository<Despesa, String> {

    List<Despesa> findByViagemIdAndUsuarioIdOrderByDataDescCriadoEmDesc(String viagemId, String usuarioId);

    Optional<Despesa> findByIdAndViagemIdAndUsuarioId(String id, String viagemId, String usuarioId);

    List<Despesa> findByUsuarioIdAndViagemIdIn(String usuarioId, Collection<String> viagemIds);
}
