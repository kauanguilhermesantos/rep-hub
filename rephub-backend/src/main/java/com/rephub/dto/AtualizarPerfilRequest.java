package com.rephub.dto;

import lombok.Data;

@Data
public class AtualizarPerfilRequest {
    private String nomeCompleto;
    private String email;
    private String telefone;
}