package com.rephub.dto;

import com.rephub.models.Usuario;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AtualizarPerfilResponse {
    private Usuario usuario;
    // Presente apenas quando o e-mail foi alterado — o frontend precisa
    // substituir o token salvo por esse, senão a próxima requisição falha
    private String token;
}