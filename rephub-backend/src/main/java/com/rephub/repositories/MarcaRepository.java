package com.rephub.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.rephub.models.Marca;

@Repository
public interface MarcaRepository extends MongoRepository<Marca, String> {
}
