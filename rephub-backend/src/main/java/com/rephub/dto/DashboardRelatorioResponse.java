package com.rephub.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Builder;
import lombok.Data;

// Dashboard de relatórios: tudo calculado no backend, o frontend só exibe
@Data
@Builder
public class DashboardRelatorioResponse {

    private ResumoComercial comercial;
    private List<PontoMensal> vendasPorMes;
    private List<MarcaDesempenho> marcas;
    private List<MarcaMensal> marcasPorMes;
    private ResumoViagens viagens;
    private List<PontoViagemMensal> viagensPorMes;
    private List<TotalCategoriaResponse> despesasPorCategoria;
    // true quando há filtro de marca: despesas não pertencem a marca, então as viagens ignoram esse filtro
    private boolean viagensIgnoramMarca;

    @Data
    @Builder
    public static class ResumoComercial {
        private int totalPedidos;
        private long totalPares;
        private BigDecimal totalVendas;
        private BigDecimal totalComissao;
        private BigDecimal ticketMedio;
        private int quantidadeMarcas;            // marcas com pedidos no filtro
        private int quantidadeMarcasCadastradas; // todas as marcas do representante
    }

    @Data
    @Builder
    public static class PontoMensal {
        private String mes; // yyyy-MM
        private int pedidos;
        private long pares;
        private BigDecimal vendas;
        private BigDecimal comissao;
    }

    @Data
    @Builder
    public static class MarcaDesempenho {
        private String marcaId;
        private String marcaNome;
        private int pedidos;
        private long pares;
        private BigDecimal vendas;
        private BigDecimal comissao;
        private BigDecimal ticketMedio;
        private BigDecimal participacaoVendas; // % do total de vendas, 1 casa decimal
    }

    @Data
    @Builder
    public static class MarcaMensal {
        private String mes;
        private String marcaId;
        private String marcaNome;
        private int pedidos;
        private BigDecimal vendas;
    }

    @Data
    @Builder
    public static class ResumoViagens {
        private int quantidade;
        private int emAndamento;
        private int finalizadas;
        private BigDecimal totalVendas;
        private BigDecimal totalDespesas;
        private BigDecimal resultado; // vendas - despesas (saldo simplificado, não é lucro líquido)
    }

    @Data
    @Builder
    public static class PontoViagemMensal {
        private String mes; // mês da data de início da viagem
        private int viagens;
        private BigDecimal vendas;
        private BigDecimal despesas;
        private BigDecimal resultado;
    }
}