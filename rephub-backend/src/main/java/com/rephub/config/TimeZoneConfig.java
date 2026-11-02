package com.rephub.config;

import java.util.TimeZone;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

/**
 * Fixa o fuso horário padrão da aplicação (por padrão, America/Sao_Paulo).
 *
 * Os campos de data/hora do RepHub são LocalDateTime (sem fuso) e o frontend os exibe como
 * horário local. Em Docker a JVM roda em UTC, então LocalDateTime.now() devolvia 23h quando
 * eram 20h em Brasília. Com o fuso padrão fixado, "agora" e as comparações com a data de
 * hoje (viagem futura, despesa futura) passam a usar o horário do Brasil, e o Mongo grava o
 * instante correto.
 *
 * Pode ser trocado com a propriedade app.timezone (ou a variável de ambiente APP_TIMEZONE).
 */
@Configuration
public class TimeZoneConfig {

    private final String fuso;

    public TimeZoneConfig(@Value("${app.timezone:America/Sao_Paulo}") String fuso) {
        this.fuso = fuso;
    }

    @PostConstruct
    void definirFusoPadrao() {
        TimeZone.setDefault(TimeZone.getTimeZone(fuso));
    }
}
