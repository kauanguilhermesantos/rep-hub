package com.rephub.models;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "marcas") // Anotação para indicar que esta classe é um documento do MongoDB e especificar a coleção
public class Marca {

    @Id
    private String id;
    private String nome;
    private Usuario usuario; // Referência ao usuário que criou a marca
    private LocalDateTime dataCadastro;
    private Integer totalPedidos;
}
