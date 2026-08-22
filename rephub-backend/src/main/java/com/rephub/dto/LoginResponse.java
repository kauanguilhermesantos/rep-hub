package com.rephub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String id;
    private String nomeCompleto;
    private String email;
}