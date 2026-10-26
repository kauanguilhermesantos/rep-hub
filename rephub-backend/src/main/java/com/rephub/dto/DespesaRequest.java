package com.rephub.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.rephub.models.CategoriaDespesa;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DespesaRequest {

    @NotNull(message = "A categoria é obrigatória")
    private CategoriaDespesa categoria;

    @NotBlank(message = "A descrição é obrigatória")
    @Size(max = 200, message = "A descrição deve ter no máximo 200 caracteres")
    private String descricao;

    @NotNull(message = "O valor é obrigatório")
    @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero")
    @Digits(integer = 10, fraction = 2, message = "O valor deve ter no máximo 2 casas decimais")
    private BigDecimal valor;

    @NotNull(message = "A data da despesa é obrigatória")
    @PastOrPresent(message = "A data da despesa não pode ser futura")
    private LocalDate data;

    @Size(max = 500, message = "As observações devem ter no máximo 500 caracteres")
    private String observacoes;
}
