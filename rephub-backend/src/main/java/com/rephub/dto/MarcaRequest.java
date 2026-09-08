package com.rephub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

// Usado tanto para criar quanto para editar marca — o corpo é o mesmo nos dois casos
@Data
public class MarcaRequest {
    @NotBlank(message = "O nome da marca é obrigatório")
    @Size(max = 100, message = "O nome da marca deve ter no máximo 100 caracteres")
    private String nome;
}