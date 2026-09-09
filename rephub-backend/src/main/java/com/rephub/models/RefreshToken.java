package com.rephub.models;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "refresh_tokens")
public class RefreshToken {
    @Id
    private String id;

    @Indexed(unique = true)
    private String token;

    private String usuarioId;
    private LocalDateTime criadoEm;
    private LocalDateTime expiraEm;
    private boolean revogado;
}