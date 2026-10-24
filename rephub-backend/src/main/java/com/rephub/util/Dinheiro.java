package com.rephub.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Valores monetários de despesas são guardados como centavos (long): soma exata,
 * sem erro de arredondamento de ponto flutuante, e agregável pelo MongoDB
 * (relatórios futuros). Na API eles trafegam como BigDecimal com 2 casas.
 */
public final class Dinheiro {

    private Dinheiro() {
    }

    /** 12.34 -> 1234. Lança ArithmeticException se houver mais de 2 casas (a validação já impede). */
    public static long aCentavos(BigDecimal valor) {
        return valor.setScale(2, RoundingMode.UNNECESSARY).movePointRight(2).longValueExact();
    }

    /** 1234 -> 12.34 */
    public static BigDecimal deCentavos(long centavos) {
        return BigDecimal.valueOf(centavos, 2);
    }

    /** Valores de pedido são Double no modelo atual; converte para BigDecimal com 2 casas. */
    public static BigDecimal deDouble(Double valor) {
        return valor == null ? BigDecimal.ZERO.setScale(2) : BigDecimal.valueOf(valor).setScale(2, RoundingMode.HALF_UP);
    }
}
