package com.rephub.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

import com.rephub.models.Viagem;

class ViagemResponseTest {

    @Test
    void lucroUsaComissaoENaoVendas() {
        // vendas 10.000, comissão 1.000, despesas 250,00 -> lucro 750, 75%
        ViagemResponse r = ViagemResponse.of(new Viagem(), 25000, 1, 2, new BigDecimal("10000"), new BigDecimal("1000"));
        assertEquals(new BigDecimal("1000.00"), r.getTotalComissao());
        assertEquals(new BigDecimal("750.00"), r.getLucro());
        assertEquals(new BigDecimal("75.00"), r.getPercentualLucro());
    }

    @Test
    void prejuizoDaPercentualNegativo() {
        ViagemResponse r = ViagemResponse.of(new Viagem(), 30000, 1, 1, BigDecimal.ZERO, new BigDecimal("200"));
        assertEquals(new BigDecimal("-100.00"), r.getLucro());
        assertEquals(new BigDecimal("-50.00"), r.getPercentualLucro());
    }

    @Test
    void semComissaoNaoDividePorZero() {
        ViagemResponse r = ViagemResponse.of(new Viagem(), 5000, 1, 0, BigDecimal.ZERO, BigDecimal.ZERO);
        assertEquals(new BigDecimal("-50.00"), r.getLucro());
        assertNull(r.getPercentualLucro());
    }
}
