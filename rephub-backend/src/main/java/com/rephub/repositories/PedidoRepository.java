package com.rephub.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.rephub.models.Pedido;

@Repository
public interface PedidoRepository extends MongoRepository<Pedido, String> {
    List<Pedido> findByUsuario_Id(String usuarioId);
}