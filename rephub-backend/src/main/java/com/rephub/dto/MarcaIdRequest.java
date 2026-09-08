package com.rephub.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MarcaIdRequest {
    @NotBlank(message = "O id da marca é obrigatório")
    private String id;
}