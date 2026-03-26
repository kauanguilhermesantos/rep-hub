package com.rephub.models;

import lombok.Data;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data // Anotação para gerar getters, setters, equals, hashCode e toString
@Document(collection = "usuarios") // Anotação para indicar que esta classe é um documento do MongoDB e especificar a coleção
public class Usuario {
    
    @Id
    private String id;

    private String nomeCompleto;

    @Indexed(unique = true)
    private String email;
    
    private String senha;
    private String telefone;
    private LocalDateTime dataCadastro;
}
