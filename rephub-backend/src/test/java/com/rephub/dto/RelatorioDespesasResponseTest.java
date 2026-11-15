package com.rephub.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.rephub.dto.RelatorioDespesasResponse.Grupo;

class RelatorioDespesasResponseTest {

    @Test
    void ordenaPorValorCalculaPercentualEAgrupaSemCampoComoNaoInformado() {
        // PIX 75,00 (2), sem forma 25,00 (1) -> total 100,00, 3 despesas
        RelatorioDespesasResponse r = RelatorioDespesasResponse.of(List.of(
                new Grupo(null, 2500, 1),
                new Grupo("PIX", 7500, 2)), chave -> null);

        assertEquals(new BigDecimal("100.00"), r.getTotalDespesas());
        assertEquals(3, r.getQuantidadeDespesas());
        assertEquals("PIX", r.getGrupos().get(0).getChave());
        assertEquals(new BigDecimal("75.00"), r.getGrupos().get(0).getPercentual());
        assertEquals("NAO_INFORMADO", r.getGrupos().get(1).getChave());
        assertEquals(new BigDecimal("25.00"), r.getGrupos().get(1).getPercentual());
        assertNull(r.getGrupos().get(0).getNome());
    }

    @Test
    void resolveNomeDoGrupo() {
        RelatorioDespesasResponse r = RelatorioDespesasResponse.of(
                List.of(new Grupo("COMBUSTIVEL", 1000, 1)), chave -> "Combustível");
        assertEquals("Combustível", r.getGrupos().get(0).getNome());
    }

    @Test
    void semDespesasNaoDividePorZero() {
        RelatorioDespesasResponse r = RelatorioDespesasResponse.of(List.of(), chave -> null);
        assertEquals(new BigDecimal("0.00"), r.getTotalDespesas());
        assertEquals(0, r.getGrupos().size());
    }
}
