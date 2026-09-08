package com.rephub.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ExcluirContaRequest {
    @NotBlank(message = "A senha é obrigatória para confirmar a exclusão")
    private String senha;
}