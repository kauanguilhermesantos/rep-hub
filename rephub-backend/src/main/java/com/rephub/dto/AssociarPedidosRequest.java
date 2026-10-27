package com.rephub.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AssociarPedidosRequest {

    @NotEmpty(message = "Selecione ao menos um pedido")
    @Size(max = 200, message = "Selecione no máximo 200 pedidos por vez")
    private List<@NotBlank(message = "Pedido inválido") String> pedidoIds;
}
