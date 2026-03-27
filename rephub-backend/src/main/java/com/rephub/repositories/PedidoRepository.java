package com.rephub.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.rephub.models.Pedido;

@Repository
public interface PedidoRepository extends MongoRepository<Pedido, String> {
}
