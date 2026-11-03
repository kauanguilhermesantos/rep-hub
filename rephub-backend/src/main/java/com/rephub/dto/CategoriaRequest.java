package com.rephub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoriaRequest {

    @NotBlank(message = "O nome da categoria é obrigatório")
    @Size(max = 40, message = "O nome deve ter no máximo 40 caracteres")
    private String nome;
}
