package com.rephub.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.Data;

// Usado tanto para criar quanto para editar pedido — o corpo é o mesmo nos dois casos
@Data
public class PedidoRequest {

    @NotNull(message = "A marca é obrigatória")
    @Valid
    private MarcaIdRequest marca;

    @NotBlank(message = "O cliente é obrigatório")
    private String cliente;

    @NotNull(message = "A quantidade de pares é obrigatória")
    @Min(value = 1, message = "A quantidade de pares deve ser maior que zero")
    private Integer quantPares;

    @NotNull(message = "O valor total é obrigatório")
    @DecimalMin(value = "0.01", message = "O valor total deve ser maior que zero")
    private Double valorTotal;

    @NotNull(message = "A comissão é obrigatória")
    @DecimalMin(value = "0.0", message = "A comissão não pode ser negativa")
    @DecimalMax(value = "100.0", message = "A comissão não pode passar de 100%")
    private Double comissaoPercentual;

    @NotNull(message = "O valor da comissão é obrigatório")
    @DecimalMin(value = "0.0", message = "O valor da comissão não pode ser negativo")
    private Double valorComissao;

    @NotBlank(message = "A condição de pagamento é obrigatória")
    private String condicaoPagamento;

    // Obrigatória ao criar (checado no controller); opcional na edição
    @Size(max = 100, message = "A cidade deve ter no máximo 100 caracteres")
    private String cidade;

    // Data do pedido (yyyy-MM-dd). Se não vier, usa a data de hoje. Só vale na criação.
    @PastOrPresent(message = "A data do pedido não pode ser futura")
    private LocalDate data;
}