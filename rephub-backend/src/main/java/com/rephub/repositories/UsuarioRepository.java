package com.rephub.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.rephub.models.Usuario;

@Repository
public interface UsuarioRepository extends MongoRepository<Usuario, String> {
    
}
