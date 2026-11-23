package com.rephub.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

// Criar e editar preposto. Dono, id e situação (ativo) NÃO são aceitos aqui.
@Data
public class PrepostoRequest {

    @NotBlank(message = "O nome é obrigatório")
    @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres")
    private String nome;

    // Telefone ou e-mail (opcional)
    @Size(max = 120, message = "O contato deve ter no máximo 120 caracteres")
    private String contato;

    @NotNull(message = "O percentual de comissão é obrigatório")
    @DecimalMin(value = "0.00", message = "O percentual de comissão não pode ser negativo")
    @DecimalMax(value = "100.00", message = "O percentual de comissão não pode passar de 100%")
    @Digits(integer = 3, fraction = 2, message = "O percentual de comissão deve ter no máximo duas casas decimais")
    private BigDecimal comissaoPercentualPadrao;

    @NotNull(message = "A data de início é obrigatória")
    private LocalDate dataInicio;

    // Opcional; não pode ser anterior à data de início (checado no service)
    private LocalDate dataFim;
}
