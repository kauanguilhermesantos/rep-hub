package com.rephub.dto;

import lombok.Data;

@Data
public class AlterarSenhaRequest {
    private String senhaAtual;
    private String novaSenha;
}