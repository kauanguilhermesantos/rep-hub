package com.rephub.repositories;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.rephub.models.Pedido;

@Repository
public interface PedidoRepository extends MongoRepository<Pedido, String> {
    List<Pedido> findByUsuario_Id(String usuarioId);
    List<Pedido> findByUsuario_IdAndDataCadastroBetween(String usuarioId, LocalDateTime inicio, LocalDateTime fim);
    List<Pedido> findByUsuario_IdOrderByDataCadastroDesc(String usuarioId, Pageable pageable);
}