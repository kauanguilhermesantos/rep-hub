package com.rephub.dto;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

// Criar e editar viagem. Status, datas de finalização, pedidos e dono NÃO são aceitos aqui.
@Data
public class ViagemRequest {

    @NotBlank(message = "O título é obrigatório")
    @Size(max = 120, message = "O título deve ter no máximo 120 caracteres")
    private String titulo;

    // Municípios visitados, em ordem (opcional)
    @Size(max = 30, message = "O roteiro pode ter no máximo 30 municípios")
    private List<@NotBlank(message = "Município inválido") @Size(max = 100, message = "Município muito longo") String> roteiro;

    @NotNull(message = "A data de início é obrigatória")
    private LocalDate dataInicio;

    @Size(max = 1000, message = "As observações devem ter no máximo 1000 caracteres")
    private String observacoes;
}
