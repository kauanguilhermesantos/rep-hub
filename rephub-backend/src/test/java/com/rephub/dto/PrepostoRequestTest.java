package com.rephub.dto;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;

import jakarta.validation.Validation;
import jakarta.validation.Validator;

// Sem banco: só as regras do Bean Validation (o mesmo que o @Valid aplica no controller)
class PrepostoRequestTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    private PrepostoRequest valido() {
        PrepostoRequest r = new PrepostoRequest();
        r.setNome("João");
        r.setComissaoPercentualPadrao(new BigDecimal("2.50"));
        r.setDataInicio(LocalDate.of(2026, 1, 1));
        return r;
    }

    private Set<String> camposInvalidos(PrepostoRequest r) {
        return validator.validate(r).stream().map(v -> v.getPropertyPath().toString()).collect(Collectors.toSet());
    }

    @Test
    void requestValidoPassa() {
        assertThat(camposInvalidos(valido())).isEmpty();
    }

    @Test
    void nomeVazioOuLongoDemais() {
        PrepostoRequest vazio = valido();
        vazio.setNome("   ");
        PrepostoRequest longo = valido();
        longo.setNome("a".repeat(121));

        assertThat(camposInvalidos(vazio)).containsExactly("nome");
        assertThat(camposInvalidos(longo)).containsExactly("nome");
    }

    @Test
    void percentualForaDaFaixaOuComTresCasas() {
        for (String valor : new String[] { "150", "-0.01", "2.555", "100.01" }) {
            PrepostoRequest r = valido();
            r.setComissaoPercentualPadrao(new BigDecimal(valor));
            assertThat(camposInvalidos(r)).as(valor).containsExactly("comissaoPercentualPadrao");
        }
        PrepostoRequest limite = valido();
        limite.setComissaoPercentualPadrao(new BigDecimal("100.00"));
        assertThat(camposInvalidos(limite)).isEmpty();
    }

    @Test
    void obrigatoriosAusentes() {
        PrepostoRequest r = valido();
        r.setDataInicio(null);
        r.setComissaoPercentualPadrao(null);

        assertThat(camposInvalidos(r)).containsExactlyInAnyOrder("dataInicio", "comissaoPercentualPadrao");
    }

    @Test
    void contatoLongoDemais() {
        PrepostoRequest r = valido();
        r.setContato("1".repeat(121));
        assertThat(camposInvalidos(r)).containsExactly("contato");
    }
}
